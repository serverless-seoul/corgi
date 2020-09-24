// List of custom errors
import { ErrorObject } from "ajv";
import { Route } from "./route";

export class TimeoutError extends Error {
  public readonly name = "TimeoutError";

  constructor(
    public readonly route: Route<any, any>
  ) {
    super("Timeout Error");
  }
}

export class ValidationError extends Error {
  public readonly name = "ValidationError";

  public constructor(
    public readonly message: string,
    public readonly details: ErrorObject[],
  ) {
    super(message);
  }
}
