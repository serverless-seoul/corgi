import { Static } from "@serverless-seoul/typebox";
import { Presenter } from "../../../../index";

import * as Schemas from "../schemas";

type AvailableSchema = (typeof Schemas)[keyof typeof Schemas];

const SchemaNames = new Map<any, string>(
  Object.entries(Schemas).map(([key, value]) => [value, key]),
);

export function createPresenter<Model, Schema extends AvailableSchema>(
  schema: Schema,
  present: (model: Model) => Promise<Static<Schema>>,
): Presenter<Model, Static<Schema>> {
  return {
    outputJSONSchema: () => ({
      $ref: `#/components/schemas/${SchemaNames.get(schema)!}`,
    }),
    present,
  };
}
