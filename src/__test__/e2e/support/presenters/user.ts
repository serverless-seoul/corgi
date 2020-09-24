import * as Models from "../models";
import * as Schemas from "../schemas";

import { createPresenter } from "./helper";

export function presentUser(user: Models.UserRecord) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
  };
}

export const UserList = createPresenter(Schemas.UserList, async (input: {
  data: Models.UserRecord[];
  paging: {
    after?: string;
  };
}) => {
  return {
    data: input.data.map((user) => presentUser(user)),
    paging: input.paging,
  };
});

export const UserShow = createPresenter(Schemas.UserShow, async (user: Models.UserRecord) => {
  return {
    data: presentUser(user),
  };
});
