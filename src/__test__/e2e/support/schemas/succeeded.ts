import { Type } from "@serverless-seoul/typebox";
import { DataLayout } from "./layout";

export const Succeeded = DataLayout(Type.Object({
  success: Type.Literal(true),
}));
