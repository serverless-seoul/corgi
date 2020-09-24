import { TStatic } from "@catchfashion/typebox";
import * as _ from "lodash";

import * as LambdaProxy from "./lambda-proxy";
import { ParameterDefinition } from "./parameter";
import { RoutingContext } from "./routing-context";

import { Middleware, MiddlewareConstructor } from "./middleware";

export type HttpMethod = "GET" | "PUT" | "POST" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
export type RouteHandler<
  T extends { [P in keyof T]: ParameterDefinition<any> },
  U extends { [P in keyof U]: TStatic }
> = (this: RoutingContext<T, U>) => Promise<LambdaProxy.Response>;
export type RouteMetadata = Map<Function, any>; // tslint:disable-line

// ---- Route
export class Route<
  T extends { [P in keyof T]: ParameterDefinition<any> },
  U extends { [P in keyof U]: TStatic }
> {

  // Simplified Constructors
  public static GET<
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TStatic }
  >(path: string, options: RouteSimplifiedOptions, params: T, handler: RouteHandler<T, U>) {
    return this._factory<T, U>(path, "GET", options, params, handler);
  }
  public static PUT<
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TStatic }
  >(path: string, options: RouteSimplifiedOptions, params: T, handler: RouteHandler<T, U>) {
    return this._factory(path, "PUT", options, params, handler);
  }
  public static POST<
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TStatic }
  >(path: string, options: RouteSimplifiedOptions, params: T, handler: RouteHandler<T, U>) {
    return this._factory(path, "POST", options, params, handler);
  }
  public static PATCH<
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TStatic }
  >(path: string, options: RouteSimplifiedOptions, params: T, handler: RouteHandler<T, U>) {
    return this._factory(path, "PATCH", options, params, handler);
  }
  public static DELETE<
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TStatic }
  >(path: string, options: RouteSimplifiedOptions, params: T, handler: RouteHandler<T, U>) {
    return this._factory(path, "DELETE", options, params, handler);
  }
  public static OPTIONS<
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TStatic }
  >(path: string, options: RouteSimplifiedOptions, params: T, handler: RouteHandler<T, U>) {
    return this._factory(path, "OPTIONS", options, params, handler);
  }
  public static HEAD<
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TStatic }
  >(path: string, options: RouteSimplifiedOptions, params: T, handler: RouteHandler<T, U>) {
    return this._factory(path, "HEAD", options, params, handler);
  }
  // tslint:enable:max-line-length

  private static _factory<
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TStatic }
  >(
    path: string,
    method: HttpMethod,
    options: RouteSimplifiedOptions,
    params: T,
    handler: RouteHandler<T, U>
  ) {
    return new this({
      path,
      method,
      desc: options.desc,
      responses: options.responses,
      operationId: options.operationId,
      metadata: options.metadata,
      params,
      handler
    });
  }
  public readonly path: string;
  public readonly method: HttpMethod;
  public readonly description: string | undefined;
  public readonly handler: RouteHandler<T, U>;
  public readonly params: T;
  public readonly operationId: string;
  public readonly responses: Map<number, ResponseSchema> | undefined;
  public readonly metadata: RouteMetadata;

  constructor(options: RouteOptions<T, U>) {
    this.path = options.path;
    this.method = options.method;
    this.description = options.desc;
    this.handler = options.handler;
    this.params = options.params || {} as T;
    this.operationId = options.operationId;
    this.responses = options.responses ? new Map(
      _.toPairs(options.responses || {})
       .map(pair => [Number(pair[0]), pair[1]] as [number, ResponseSchema])
    ) : undefined;
    this.metadata = options.metadata || new Map();
  }

  public getMetadata<Metadata>(klass: MiddlewareConstructor<Middleware<Metadata>>): Metadata | undefined {
    return this.metadata.get(klass);
  }
}

export interface RouteSimplifiedOptions {
  desc?: string;
  operationId: string;
  responses?: { [statusCode: number]: ResponseSchema };
  metadata?: RouteMetadata;
}

export interface RouteOptions<
  T extends { [P in keyof T]: ParameterDefinition<any> },
  U extends { [P in keyof U]: TStatic }
> {
  path: string;
  method: HttpMethod;
  desc?: string;
  operationId: string;
  responses?: { [statusCode: number]: ResponseSchema };
  metadata?: RouteMetadata;
  params?: T;
  handler: RouteHandler<T, U>;
}

export interface ResponseSchema {
  desc?: string;
  schema: JSONSchema;
}

/**
 *  Actual JSON Schema in JSON representation
 */
export type JSONSchema = object;
