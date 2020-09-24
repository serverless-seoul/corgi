import { Static, TOptional, TStatic, Type } from "@serverless-seoul/typebox";
import * as Ajv from "ajv";
import * as _ from "lodash";
import * as qs from "qs";
import { ValidationError } from "./errors";
import * as LambdaProxy from "./lambda-proxy";

import { ParameterDefinition, ParameterInputType } from "./parameter";
import { Router } from "./router";

const ajv = new Ajv({
  allErrors: true,
  async: false,
  coerceTypes: true,
  removeAdditional: "all",
});

type NamespaceParameterType<T extends { [P in keyof T]: TStatic }> = string extends keyof T
  ? {}
  : { [P in keyof T]: Static<T[P]> };

type RouteParameterType<T extends { [P in keyof T]: ParameterDefinition<any> }> = string extends keyof T
  ? {}
  : { [P in keyof T]: T[P] extends TOptional<any> ? Static<T[P]["def"]> : Static<T[P]> };

// ---- RoutingContext
export class RoutingContext<
  T extends { [P in keyof T]: ParameterDefinition<any> },
  U extends { [P in keyof U]: TStatic } = {}
> {

  get headers(): LambdaProxy.Event["headers"] {
    // normalize works lazily and should be cached for further use
    return this.normalizedHeaders
      || (this.normalizedHeaders = this.normalizeHeaders(this.request.headers));
  }

  get params() {
    return this.validatedParams;
  }

  // Body Parser
  get bodyJSON(): object | string | undefined {
    const body = this.request.isBase64Encoded ?
      Buffer.from(this.request.body as string, "base64").toString("utf8") :
      this.request.body;

    switch (this.headers["content-type"]) {
      case "application/x-www-form-urlencoded": {
        if (body) {
          return qs.parse(body);
        } else {
          return undefined;
        }
      }
      case "text": {
        return body ?? undefined;
      }
      case "application/json":
      default: {
        // default is json
        return body ? JSON.parse(body) : {};
      }
    }
  }
  private readonly validatedParams:
    // Inferred Namespace Parameter
    NamespaceParameterType<U> &
    // Inferred Route Parameter
    RouteParameterType<T> &
    // Unknown keys should be unknown type
    // Below type is just for assigning custom parameter in Namespace#before
    { [key: string]: unknown };
  private normalizedHeaders: { [key: string]: string } | null;

  constructor(
    public readonly router: Router,
    public readonly request: LambdaProxy.Event,
    public readonly requestId: string | undefined,
    private pathParams: { [key: string]: string }
  ) {
    this.validatedParams = {} as any;
    this.normalizedHeaders = null;
  }

  public validateAndUpdateParams(parameterDefinitionMap: { [key: string]: ParameterDefinition<any> }) {
    const groupByIn = Object.entries(parameterDefinitionMap).reduce((hash, [name, schema]) => {
      hash[schema.in] ||= {};
      hash[schema.in]![name] = schema.def;

      return hash;
    }, {} as {
      [k in ParameterInputType]?: {
        [key: string]: ParameterDefinition<any>;
      };
    });

    const validate = (rawParams: any, schemaMap: { [key: string]: TStatic }) => {
      const params = _.cloneDeep(rawParams ?? {});
      const valid = ajv.validate(Type.Object(schemaMap), params);

      if (!valid) {
        const errors = ajv.errors!;
        throw new ValidationError(ajv.errorsText(errors), errors);
      }

      Object.assign(this.validatedParams, params);
    };

    if (groupByIn.path) {
      validate(this.decodeURI(this.pathParams), groupByIn.path);
    }
    if (groupByIn.query) {
      // API Gateway only support string parsing.
      // but with this, now it would support Array<String> / Map<String, String> parsing too
      const queryStringParameters = qs.parse(qs.stringify(this.request.queryStringParameters));
      validate(queryStringParameters, groupByIn.query);
    }
    if (groupByIn.body) {
      validate(this.bodyJSON, groupByIn.body);
    }
  }

  // Response Helpers
  public json(
    json: any,
    statusCode: number = 200,
    headers: NonNullable<LambdaProxy.Response["headers"]> = {}
  ): LambdaProxy.Response {
    return {
      statusCode,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...headers,
      },
      body: JSON.stringify(json),
    };
  }

  private decodeURI(object: { [key: string]: any }) {
    return _.mapValues(object, (value, key) => {
      if (typeof value === "string") {
        try {
          return decodeURIComponent(value);
        } catch (e) {
          return value;
        }
      } else {
        return value;
      }
    });
  }

  // Helper for normalizing request headers
  private normalizeHeaders(headers: LambdaProxy.Event["headers"] = {}) {
    return Object.keys(headers).reduce((hash, key) => {
      hash[key.toLowerCase()] = headers[key];

      return hash;
    }, Object.create(null));
  }
}
