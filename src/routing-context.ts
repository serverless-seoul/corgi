import { Static, TObject, TSchema, Type } from "@serverless-seoul/typebox";
import * as _ from "lodash";
import * as qs from "qs";
import { ValidationError } from "./errors";
import * as LambdaProxy from "./lambda-proxy";

import { ajv } from "./ajv";
import { ParameterDefinition, ParameterInputType } from "./parameter";
import { Router } from "./router";

type ParameterType<T extends { [P in keyof T]: TSchema }> = string extends keyof T
  ? {}
  : Static<TObject<T>>;

type ExtractParameter<T extends { [P in keyof T]: ParameterDefinition<TSchema> }> = {
  [P in keyof T]: T[P]["def"];
};

// ---- RoutingContext
export class RoutingContext<
  T extends { [P in keyof T]: ParameterDefinition<TSchema> },
  U extends { [P in keyof U]: TSchema } = {}
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
    ParameterType<U> &
    // Inferred Route Parameter
    ParameterType<ExtractParameter<T>> &
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
        [key: string]: TSchema;
      };
    });

    const validate = (rawParams: any, schemaMap: { [key: string]: TSchema }) => {
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
      const multiValueQueryStringParameters = qs.parse(qs.stringify(this.request.multiValueQueryStringParameters));

      // AJV does not support non-scalar type coercion (e.g. String <-> Object)
      // Due to this limitation, we have to iterate each schemas, try validate with manual type casting
      const errors = Object.entries(groupByIn.query).reduce((collection, [key, schema]) => {
        // Perform first validation using raw value
        let caught: ValidationError | null = null;

        const value = schema.type === "array"
          ? (() => {
              try {
                // handle case like ?a=[1,2,3,4]
                if (JSON.parse(queryStringParameters[key] as any) instanceof Array) {
                  return queryStringParameters[key];
                }
              } catch (e) {}
              return multiValueQueryStringParameters[key];
            })()
          : queryStringParameters[key];

        try {
          validate({
            [key]: value,
          }, {
            [key]: schema,
          });
        } catch (e) {
          caught = e;
        }

        // If validation was failed, perform manual type casting and perform validation again
        if (caught) {
          const raw = value;
          const casted = this.castJSON(raw);

          // If cast was failed, throw captured error
          if (raw === casted) {
            collection.push(caught);
            return collection;
          }

          try {
            validate({
              [key]: casted,
            }, {
              [key]: schema,
            });
          } catch (e) {
            collection.push(e);
            return collection;
          }
        }

        return collection;
      }, [] as ValidationError[]);

      // Build Aggregated ValidationError if needed
      if (errors.length > 0) {
        throw new ValidationError(
          errors.map((error) => error.message).join(", "),
          errors.flatMap((error) => error.details),
        );
      }
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

  private castJSON(value: any) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
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
