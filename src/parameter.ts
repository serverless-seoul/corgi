import { TSchema } from "@serverless-seoul/typebox";

export type ParameterInputType = "query" | "header" | "path" | "body";
export interface ParameterDefinition<T extends TSchema> {
  in: ParameterInputType;
  def: T;
}
export class Parameter {
  public static Query<T extends TSchema>(schema: T): ParameterDefinition<T> {
    return { in: "query", def: schema };
  }

  public static Path<T extends TSchema>(schema: T): ParameterDefinition<T> {
    return { in: "path", def: schema };
  }

  public static Body<T extends TSchema>(schema: T): ParameterDefinition<T> {
    return { in: "body", def: schema };
  }
}
