import { TStatic } from "@serverless-seoul/typebox";

export type ParameterInputType = "query" | "header" | "path" | "body";
export interface ParameterDefinition<T extends TStatic> {
  in: ParameterInputType;
  def: T;
}
export class Parameter {
  public static Query<T extends TStatic>(schema: T): ParameterDefinition<T> {
    return { in: "query", def: schema };
  }

  public static Path<T extends TStatic>(schema: T): ParameterDefinition<T> {
    return { in: "path", def: schema };
  }

  public static Body<T extends TStatic>(schema: T): ParameterDefinition<T> {
    return { in: "body", def: schema };
  }
}
