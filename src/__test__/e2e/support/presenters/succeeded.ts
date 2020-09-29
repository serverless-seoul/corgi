import * as Schemas from "../schemas";
import { createPresenter } from "./helper";

export const Succeeded = createPresenter(Schemas.Succeeded, async (success: true) => {
  return { data: success };
});
