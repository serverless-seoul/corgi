import { OptionalModifier, TStatic } from "@serverless-seoul/typebox";
import * as OpenApi from "openapi3-ts";

import * as LambdaProxy from "../lambda-proxy";

import { Namespace, Routes } from "../namespace";
import { ParameterDefinition, ParameterInputType } from "../parameter";
import { JSONSchema, Route} from "../route";

import { flattenRoutes } from "../router";

export type OpenAPIRouteOptions = (
  // OpenAPI.Info &
  { title: string, version: string } &
  { definitions?: { [definitionsName: string]: JSONSchema } }
);

export class OpenAPIRoute extends Namespace<any, any> {
  constructor(
    path: string,
    info: OpenAPIRouteOptions,
    routes: Routes
  ) {

    const CorsHeaders = function(origin: string) {
      return {
        "Access-Control-Allow-Origin": origin || "",
        "Access-Control-Allow-Headers": [
          "Content-Type",
        ].join(", "),
        "Access-Control-Allow-Methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].join(", "),
        "Access-Control-Max-Age": `${60 * 60 * 24 * 30}`,
      };
    };

    super(path, {}, {
      children: [
        Route.OPTIONS(
          "", { desc: "CORS Preflight Endpoint for OpenAPI Documentation API", operationId: "optionOpenAPI" }, {},
          async function() {
            return this.json("", 204, CorsHeaders(this.headers.origin));
          }),

        Route.GET("", { desc: "OpenAPI Documentation API", operationId: "getOpenAPI" }, {},
          async function() {
            const docGenerator = new OpenAPIGenerator();
            const json = docGenerator.generateJSON(info, this.request, routes);
            return this.json(json, 200, CorsHeaders(this.headers.origin));
          }),
      ],
    });
  }
}

export class OpenAPIGenerator {
  constructor() {
    //
  }

  public generateJSON(
    info: OpenAPIRouteOptions,
    request: LambdaProxy.Event,
    cascadedRoutes: Routes
  ) {
    const paths: OpenApi.PathsObject = {};

    flattenRoutes(cascadedRoutes).forEach((routes) => {
      const endRoute = (routes[routes.length - 1] as Route<any, any>);
      const corgiPath = routes.map(r => r.path).join("");
      const OpenAPIPath = this.toOpenAPIPath(corgiPath);

      if (!paths[OpenAPIPath]) {
        paths[OpenAPIPath] = {};
      }

      paths[OpenAPIPath][(() => {
        switch (endRoute.method) {
          case "GET": return "get" as const;
          case "PUT": return "put" as const;
          case "POST": return "post" as const;
          case "PATCH": return "patch" as const;
          case "DELETE": return "delete" as const;
          case "OPTIONS": return "options" as const;
          case "HEAD": return "head" as const;
        }
      })()] = (() => {
        const operation: OpenApi.OperationObject = {
          description: endRoute.description,
          operationId: endRoute.operationId,
          parameters:
            routes.flatMap((route): OpenApi.ParameterObject[] => {
              if (route instanceof Namespace) {
                // Namespace only supports path
                return Object.entries(route.params)
                  .map(([name, schema]: [string, TStatic]): OpenApi.ParameterObject => ({
                    in: "path",
                    name,
                    description: schema.description,
                    schema,
                    required: true,
                  }));
              } else {
                return Object.entries<ParameterDefinition<any>>(route.params)
                  .filter(([name, param]) => param.in !== "body")
                  .map(([name, param]): OpenApi.ParameterObject => ({
                    in: param.in as Exclude<ParameterInputType, "body">,
                    name,
                    description: param.def.description,
                    schema: param.def,
                    required: param.in === "path" || param.def.modifier !== OptionalModifier,
                  }));
              }
            }),
          requestBody: (() => {
            const bodyParams = routes
              .flatMap((route) => route instanceof Route
                ? Object.entries<ParameterDefinition<any>>(route.params)
                    .filter(([name, param]: [string, ParameterDefinition<any>]) => param.in === "body")
                : []
              )
              .map(([name, param]) => [name, param.def]);

            if (bodyParams.length > 0) {
              return {
                description: "Body",
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object" as const,
                      properties: Object.fromEntries(bodyParams),
                      required: bodyParams.map(([name]) => name),
                    },
                  },
                },
              };
            } else {
              return undefined;
            }
          })(),
          responses: (() => {
            if (endRoute.responses) {
              return Array.from(endRoute.responses)
                .reduce((obj, [statusCode, response]) => {
                  obj[statusCode] = {
                    description: response.desc || "",
                    content: {
                      "application/json": {
                        schema: response.schema,
                      },
                    },
                  };
                  return obj;
                }, {} as { [key: string]: OpenApi.ResponsesObject });
            } else {
              return {
                200: {
                  description: "Success"
                }
              };
            }
          })(),
        };
        return operation;
      })();
    });

    const spec: OpenApi.OpenAPIObject = {
      openapi: "3.0.1",
      info: {
        title: info.title,
        version: info.version,
      },
      servers: [{
        url: `${request.headers["X-Forwarded-Proto"]}://${request.headers.Host}/${request.requestContext!.stage}/`,
      }],
      tags: [],
      paths,
      components: {
        schemas: info.definitions,
      },
    };
    return spec;
  }

  public toOpenAPIPath(path: string) {
    return path.replace(/:(\w+)/g, "{$1}");
  }
}
