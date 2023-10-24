import { Type } from "@sinclair/typebox";
import { DataLayout } from "./layout";

export const Succeeded = DataLayout(Type.Object({
  success: Type.Literal(true),
}));
