import { TStatic } from "@serverless-seoul/typebox";
import { Response } from "./lambda-proxy";
import { Route } from "./route";
import { RoutingContext } from "./routing-context";

type MergeParams<T, U> = string extends keyof U ? T : T & U;

// ---- Namespace
export class Namespace<
  T extends { [P in keyof T]: TStatic },
  U extends { [P in keyof U]: TStatic } = { [key: string]: TStatic }
> {
  constructor(
    public readonly path: string,
    public readonly params: T,
    public readonly options: {
      before?: (this: RoutingContext<any, MergeParams<T, U>>) => Promise<void>;
      exceptionHandler?: ExceptionHandler<Partial<MergeParams<T, U>>>;
      /**
       * All the params are from 'PATH'. namespace currently won't support query param validation or access
       */
      children: Routes<MergeParams<T, U>>;
    }
  ) {
    if (options.children.length === 0) {
      throw new Error("Namespace must have children");
    }
  }

  get before() { return this.options.before; }
  get children() { return this.options.children; }
  get exceptionHandler() { return this.options.exceptionHandler; }
}

// if it's void, it's failed to handler error
export type ExceptionHandler<T> = (this: RoutingContext<any, T>, error: Error) => Promise<Response | void>;

export type Routes<T = any> = Array<Namespace<any, T> | Route<any, T>>;
