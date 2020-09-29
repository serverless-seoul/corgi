import * as Models from "../models";
import * as Schemas from "../schemas";
import { createPresenter } from "./helper";
import { presentUser } from "./user";

function presentMessage(message: Models.MessageRecord) {
  return {
    id: message.id,
    status: message.status,
    user: presentUser(message.user),
    content: message.content,
    readonly: message.readonly,
  };
}

export const MessageList = createPresenter(Schemas.MessageList, async (input: {
  data: Models.MessageRecord[];
  paging: {
    after?: string;
  };
}) => {
  return {
    data: input.data.map((message) => presentMessage(message)),
    paging: input.paging,
  };
});

export const MessageShow = createPresenter(Schemas.MessageShow, async (message: Models.MessageRecord) => {
  return {
    data: presentMessage(message),
  };
});
