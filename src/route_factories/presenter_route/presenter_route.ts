import { TSchema } from "@sinclair/typebox";
import {
  ParameterDefinition,
} from "../../parameter";
import {
  HttpMethod,
  Route,
  RouteSimplifiedOptions,
} from "../../route";
import { RoutingContext } from "../../routing-context";

import { Presenter } from "./presenter";

export type PresenterRouteHandler<
  Input,
  T extends { [P in keyof T]: ParameterDefinition<any> },
  U extends { [P in keyof U]: TSchema }
> = unknown extends Input ? never : (this: RoutingContext<T, U>) => Promise<Input>;

export class PresenterRouteFactory {
  public static create<
    Entity,
    Output,
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TSchema }
  >(
    path: string,
    method: HttpMethod,
    options: RouteSimplifiedOptions,
    params: T,
    presenter: Presenter<Entity, Output>,
    handler: PresenterRouteHandler<Entity, T, U>
  ): Route<T, U> {
    return new Route<T, U>({
      path,
      method,
      desc: options.desc,
      operationId: options.operationId,
      responses: Object.assign(options.responses || {}, {
        200: {
          desc: "Success",
          schema: presenter.outputJSONSchema(),
        },
      }),
      metadata: options.metadata,
      params,
      async handler() {
        const res = await handler.call(this);
        return this.json(await presenter.present(res));
      },
    });
  }

  // Simplified Constructors
  public static GET<
    Input,
    Output,
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TSchema }
  >(path: string, options: RouteSimplifiedOptions, params: T, presenter: Presenter<Input, Output>, handler: PresenterRouteHandler<Input, T, U>) {
    return this.create(path, "GET", options, params, presenter, handler);
  }
  public static POST<
    Input,
    Output,
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TSchema }
  >(path: string, options: RouteSimplifiedOptions, params: T, presenter: Presenter<Input, Output>, handler: PresenterRouteHandler<Input, T, U>) {
    return this.create(path, "POST", options, params, presenter, handler);
  }
  public static PUT<
    Input,
    Output,
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TSchema }
  >(path: string, options: RouteSimplifiedOptions, params: T, presenter: Presenter<Input, Output>, handler: PresenterRouteHandler<Input, T, U>) {
    return this.create(path, "PUT", options, params, presenter, handler);
  }
  public static PATCH<
    Input,
    Output,
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TSchema }
  >(path: string, options: RouteSimplifiedOptions, params: T, presenter: Presenter<Input, Output>, handler: PresenterRouteHandler<Input, T, U>) {
    return this.create(path, "PATCH", options, params, presenter, handler);
  }
  public static DELETE<
    Input,
    Output,
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TSchema }
  >(path: string, options: RouteSimplifiedOptions, params: T, presenter: Presenter<Input, Output>, handler: PresenterRouteHandler<Input, T, U>) {
    return this.create(path, "DELETE", options, params, presenter, handler);
  }
  public static OPTIONS<
    Input,
    Output,
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TSchema }
  >(path: string, options: RouteSimplifiedOptions, params: T, presenter: Presenter<Input, Output>, handler: PresenterRouteHandler<Input, T, U>) {
    return this.create(path, "OPTIONS", options, params, presenter, handler);
  }
  public static HEAD<
    Input,
    Output,
    T extends { [P in keyof T]: ParameterDefinition<any> },
    U extends { [P in keyof U]: TSchema }
  >(path: string, options: RouteSimplifiedOptions, params: T, presenter: Presenter<Input, Output>, handler: PresenterRouteHandler<Input, T, U>) {
    return this.create(path, "HEAD", options, params, presenter, handler);
  }
}
