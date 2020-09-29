import { Type } from "@serverless-seoul/typebox";
import { DataLayout, PaginatedDataLayout } from "./layout";
import { User } from "./user";

export const Message = Type.Object({
  id: Type.Integer(),
  status: Type.Union([
    Type.Literal("active"),
    Type.Literal("deleted"),
  ]),
  user: User,
  content: Type.String(),
  readonly: Type.Optional(Type.Boolean()),
});

export const MessageShow = DataLayout(Message);
export const MessageList = PaginatedDataLayout(Message);
