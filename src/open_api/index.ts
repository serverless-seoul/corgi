import { Optional, TSchema } from "@sinclair/typebox";
import * as OpenApi from "openapi3-ts";
import * as traverse from "traverse";

import * as LambdaProxy from "../lambda-proxy";

import { Namespace, Routes } from "../namespace";
import { ParameterDefinition, ParameterInputType } from "../parameter";
import { JSONSchema, Route} from "../route";

import { flattenRoutes } from "../router";

const dotPath = (paths: string[]): string => paths.join(".");

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

    const CorsHeaders = function(origin?: string): Record<string, string> {
      if (origin) {
        return {
          "Access-Control-Allow-Origin": origin || "",
          "Access-Control-Allow-Headers": [
            "Content-Type",
          ].join(", "),
          "Access-Control-Allow-Methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].join(", "),
          "Access-Control-Max-Age": `${60 * 60 * 24 * 30}`,
        };
      } else {
        return {};
      }
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
    const schemas: OpenApi.SchemasObject = info.definitions || {};
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
                  .map(([name, schema]: [string, TSchema]): OpenApi.ParameterObject => ({
                    in: "path",
                    name,
                    description: schema.description,
                    schema: this.replaceReferencedSchemas(schema, schemas),
                    required: true,
                  }));
              } else {
                return Object.entries<ParameterDefinition<any>>(route.params)
                  .filter(([name, param]) => param.in !== "body")
                  .map(([name, param]): OpenApi.ParameterObject => ({
                    in: param.in as Exclude<ParameterInputType, "body">,
                    name,
                    description: param.def.description,
                    schema: this.replaceReferencedSchemas(param.def, schemas),
                    required: param.in === "path" || param.def.modifier !== Optional,
                  }));
              }
            }),
          requestBody: (() => {
            const bodyParams = routes
              .flatMap((route) => route instanceof Route
                ? Object.entries<ParameterDefinition<any>>(route.params)
                    .filter(([name, param]: [string, ParameterDefinition<any>]) => param.in === "body")
                : []
              );

            if (bodyParams.length > 0) {
              return {
                description: "Body",
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object" as const,
                      properties: Object.fromEntries(
                        bodyParams.map(([name, param]) => [
                          name,
                          this.replaceReferencedSchemas(param.def, schemas),
                        ] as const),
                      ),
                      required: bodyParams.reduce((collection, [name, param]) => {
                        if (param.def.modifier !== Optional) {
                          collection.push(name);
                        }

                        return collection;
                      }, [] as string[]),
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
        schemas: this.mergeSchemas(schemas),
      },
    };
    return spec;
  }

  public toOpenAPIPath(path: string) {
    return path.replace(/:(\w+)/g, "{$1}");
  }

  private mergeSchemas(schemas: OpenApi.SchemasObject): OpenApi.SchemasObject {
    const lookupTable = new Map<any, string>(
      Object.entries(schemas).map(([key, value]) => [value, key]),
    );

    const tree = traverse(schemas);

    const references = tree.reduce(function(hash, node) {
      if (typeof node === "object") {
        const referencedSchema = lookupTable.get(node);
        if (referencedSchema && this.level > 1) {
          const path = dotPath(this.path);
          hash[path] = referencedSchema;
        }
      }

      return hash;
    }, {} as { [path: string]: string });

    return tree.map(function() {
      const path = dotPath(this.path);
      const referencedSchema = references[path];
      if (referencedSchema) {
        this.update({
          $ref: `#/components/schemas/${referencedSchema}`,
        }, true);
      }
    });
  }

  private replaceReferencedSchemas(target: TSchema, schemas: OpenApi.SchemasObject): OpenApi.SchemaObject {
    const lookupTable = new Map<any, string>(
      Object.entries(schemas).map(([key, value]) => [value, key]),
    );

    const tree = traverse(target);

    const references = tree.reduce(function(hash, node) {
      if (typeof node === "object") {
        const referencedSchema = lookupTable.get(node);
        if (referencedSchema) {
          const path = dotPath(this.path);
          hash[path] = referencedSchema;
        }
      }

      return hash;
    }, {} as { [path: string]: string });

    return tree.map(function() {
      const path = dotPath(this.path);
      const referencedSchema = references[path];
      if (referencedSchema) {
        this.update({
          $ref: `#/components/schemas/${referencedSchema}`,
        }, true);
      }
    });
  }
}
