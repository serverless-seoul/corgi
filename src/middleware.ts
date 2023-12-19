import { Response } from "./lambda-proxy";
import { Route } from "./route";
import { RoutingContext } from "./routing-context";

export type MiddlewareConstructor<MiddlewareClass extends Middleware> = new(options: any) => MiddlewareClass;

export class Middleware<Metadata= any> {
  // runs before the application, if it returns Promise<Response>, Routes are ignored and return the response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async before(options: MiddlewareBeforeOptions<Metadata>): Promise<Response | void> {
    //
  }

  // runs after the application, should return response
  public async after(options: MiddlewareAfterOptions<Metadata>): Promise<Response> {
    return options.response;
  }
}

export interface MiddlewareBeforeOptions<Metadata> {
  routingContext: RoutingContext<any, any>;
  currentRoute: Route<any, any>;
  metadata?: Metadata;
}

export interface MiddlewareAfterOptions<Metadata> {
  routingContext: RoutingContext<any, any>;
  currentRoute: Route<any, any>;
  metadata?: Metadata;
  response: Response;
}
