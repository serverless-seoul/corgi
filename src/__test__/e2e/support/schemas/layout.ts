import { TSchema, Type } from "@serverless-seoul/typebox";

export function DataLayout(schema: TSchema) {
  return Type.Object({
    data: schema,
  });
}

export function PaginatedDataLayout(schema: TSchema) {
  return Type.Object({
    data: Type.Array(schema),
    paging: Type.Object({
      after: Type.Optional(Type.String()),
    }),
  });
}
