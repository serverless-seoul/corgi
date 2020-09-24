import * as Models from "../models";

export const Users: Models.UserRecord[] = [{
  id: 1,
  username: "foo",
  email: "foo@example.com",
  password: "encrypted",
  createdAt: new Date("2020-01-02 03:04:05"),
  updatedAt: new Date("2020-01-02 03:04:05"),
}, {
  id: 2,
  username: "bar",
  email: "bar@example.com",
  password: "encrypted2",
  createdAt: new Date("2020-02-02 03:04:05"),
  updatedAt: new Date("2020-02-02 03:04:05"),
}];
