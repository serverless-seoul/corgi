import { Type } from "@serverless-seoul/typebox";

import { Namespace, Parameter, PresenterRouteFactory, StandardError } from "../../../../index";
import * as Fixtures from "../fixtures";
import * as Models from "../models";
import * as Presenters from "../presenters";
import * as Schemas from "../schemas";

export const route = new Namespace("/messages", {}, {
  children: [
    PresenterRouteFactory.GET("", {
      operationId: "listMessages",
      desc: "List Messages",
    }, {
      count: Parameter.Query(Type.Optional(Type.Integer({ minimum: 1, maximum: 100 }))),
      after: Parameter.Query(Type.Optional(Type.String())),
    }, Presenters.MessageList, async function() {
      this.params.count?.toFixed(3);
      this.params.after?.slice(0, 3);
      return {
        data: Fixtures.Messages,
        paging: { after: "afterKey" },
      };
    }),

    PresenterRouteFactory.POST("", {
      operationId: "createMessage",
      desc: "Create a new Message",
    }, {
      message: Parameter.Body(Schemas.Message),
    }, Presenters.MessageShow, async function() {
      return this.params.message;
    }),

    new Namespace("/:id", {
      id: Type.Integer(),
    }, {
      async before() {
        const id = this.params.id;
        const message = Fixtures.Messages.find((record) => record.id === id);
        if (!message) {
          throw new StandardError(404, {
            code: "MESSAGE_NOT_FOUND",
            message: "The request message does not exist",
          });
        }

        this.params.record = message;
      },
      children: [
        PresenterRouteFactory.GET("", {
          operationId: "describeMessage",
          desc: "Describe given message",
        }, {}, Presenters.MessageShow, async function() {
          return this.params.record as Models.MessageRecord;
        }),

        PresenterRouteFactory.PUT("", {
          operationId: "updateMessage",
          desc: "Update given message",
        }, {
          message: Parameter.Body(Schemas.Message),
        }, Presenters.MessageShow, async function() {
          return this.params.message;
        }),

        PresenterRouteFactory.DELETE("", {
          operationId: "deleteMessage",
          desc: "Delete given message",
        }, {}, Presenters.Succeeded, async function() {
          return true as const;
        }),
      ],
    }),
  ],
});
