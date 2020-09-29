import * as Models from "../models";
import { Users } from "./user";

export const Messages: Models.MessageRecord[] = [{
  id: 1,
  status: "active",
  user: Users[0],
  content: "one",
  readonly: true,
  createdAt: new Date("2020-01-02 03:04:05"),
  updatedAt: new Date("2020-01-02 03:04:05"),
}, {
  id: 2,
  status: "deleted",
  user: Users[1],
  content: "two",
  createdAt: new Date("2020-02-02 03:04:05"),
  updatedAt: new Date("2020-02-02 03:04:05"),
}, {
  id: 3,
  status: "active",
  user: Users[0],
  content: "three",
  createdAt: new Date("2020-03-02 03:04:05"),
  updatedAt: new Date("2020-03-02 03:04:05"),
}];
