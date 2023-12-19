import { Namespace, Parameter, PresenterRouteFactory } from "../../../../index";
import * as Fixtures from "../fixtures";
import * as Presenters from "../presenters";
import { User } from "../schemas";

export const route = new Namespace("/api/me", {}, {
  children: [
    PresenterRouteFactory.GET("", {
      operationId: "describeMe",
      desc: "Describe current user",
    }, {}, Presenters.UserShow, async function() {
      return Fixtures.Users[0];
    }),

    PresenterRouteFactory.POST("", {
      operationId: "createMe",
      desc: "Create User",
    }, {
      user: Parameter.Body(User),
    }, Presenters.UserShow, async function() {
      return Fixtures.Users[0];
    }),
  ],
});
