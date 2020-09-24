import { TStatic, Type } from "@serverless-seoul/typebox";

export function DataLayout(schema: TStatic) {
  return Type.Object({
    data: schema,
  });
}

export function PaginatedDataLayout(schema: TStatic) {
  return Type.Object({
    data: Type.Array(schema),
    paging: Type.Object({
      after: Type.Optional(Type.String()),
    }),
  });
}
