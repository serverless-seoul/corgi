import { Type } from "@sinclair/typebox";
import { DataLayout, PaginatedDataLayout } from "./layout";

export const User = Type.Object({
  id: Type.Integer(),
  email: Type.String({ format: "email" }),
  username: Type.String(),
});

export const UserShow = DataLayout(User);
export const UserList = PaginatedDataLayout(User);
