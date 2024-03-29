import { expect } from "chai";

import { Route } from "../route";

describe("Route", () => {
  describe("#constructor", () => {
    it("should construct object with given options", () => {
      const route =
        new Route({
          path: "/followers",
          method: "GET",
          operationId: "getFollowers",
          desc: "List of users that following me",
          async handler() {
            return this.json({
              data: {},
            });
          },
        });

      expect(route.operationId).to.eq("getFollowers");
      expect(route.path).to.deep.eq("/followers");
      expect(route.method).to.deep.eq("GET");
      expect(route.description).to.deep.eq("List of users that following me");
    });
  });

  describe("#getMetadata", () => {
    it("should get metadata by class of metadata", () => {
      class A {}

      const route =
        new Route({
          path: "/followers",
          method: "GET",
          operationId: "getFollowers",
          desc: "List of users that following me",
          metadata: new Map([
            [A, { x: 200 }],
          ]),
          async handler() {
            return this.json({
              data: {},
            });
          },
        });

      expect(route.getMetadata(A as any)).to.deep.eq({ x: 200 });
    });
  });
});
