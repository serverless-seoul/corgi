import { Namespace, PresenterRouteFactory } from "../../../../index";
import * as Fixtures from "../fixtures";
import * as Presenters from "../presenters";

export const route = new Namespace("/me", {}, {
  children: [
    PresenterRouteFactory.GET("", {
      operationId: "describeMe",
      desc: "Describe current user",
    }, {}, Presenters.UserShow, async function() {
      return Fixtures.Users[0];
    }),
  ],
});
