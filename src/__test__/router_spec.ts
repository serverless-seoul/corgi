import { expect } from "chai";

import {
  Middleware,
  MiddlewareAfterOptions,
  MiddlewareBeforeOptions,
  Namespace,
  Response,
  Route,
  Router,
  TimeoutError,
} from "../index";

describe("Router", () => {
  describe("#constructor", () => {
    it("should raise error if there is duplicated operationId", () => {
      expect(() => {
        return new Router([
          Route.GET("/", { operationId: "getIndex" }, {}, async function() {
            return this.json("");
          }),
          Route.GET("/wrong-path", { operationId: "getIndex" }, {}, async function() {
            return this.json("");
          }),
        ]);
      }).to.throw(Error, "2 Routes has duplicated operationId: \"getIndex\"");
    });

    it ("should raise error if their are duplicated middleware", async () => {
      expect(() => {
        class TestMiddleware extends Middleware {}

        return new Router([
          Route.GET("/", { operationId: "getIndex" }, {}, async function() {
            return {
              statusCode: 200,
              headers: { "Content-Type": "application/json; charset=utf-8" },
              body: this.request.body!,
            };
          }),
        ], {
          middlewares: [
            new TestMiddleware(),
            new TestMiddleware(),
          ],
        });
      }).to.throw("Middleware<TestMiddleware> should be unique but not");
    });
  });

  describe("#findMiddleware", () => {
    it("should return middleware", () => {
      class M1 extends Middleware {}
      class M2 extends Middleware {}
      class M3 extends Middleware {}

      const router = new Router([
        Route.GET("/", { operationId: "getIndex" }, {}, async function() {
          return this.json({});
        }),
      ], {
        middlewares: [
          new M1(), new M2(),
        ],
      });

      expect(router.findMiddleware(M1)).to.be.instanceOf(M1);
      expect(router.findMiddleware(M2)).to.be.instanceOf(M2);
      expect(router.findMiddleware(M3)).to.be.eq(undefined);
    });
  });

  describe("#handler", () => {
    describe("middlewares", () => {
      it("should run middlewares one by one in order", async () => {
        const router = new Router([
          Route.GET("/", { operationId: "getIndex" }, {}, async function() {
            return {
              statusCode: 200,
              headers: { "Content-Type": "application/json; charset=utf-8" },
              body: this.request.body!,
            };
          }),
        ], {
          middlewares: [
            new (class TestMiddleware extends Middleware {
              public async before(options: MiddlewareBeforeOptions<undefined>): Promise<Response | void> {
                options.routingContext.request.body = "A";
              }
              public async after(options: MiddlewareAfterOptions<undefined>): Promise<Response> {
                options.response.body += "C";
                return options.response;
              }
            })(),
            new (class TestMiddleware extends Middleware {
              public async before(options: MiddlewareBeforeOptions<undefined>): Promise<Response | void> {
                options.routingContext.request.body += "B";
              }
              public async after(options: MiddlewareAfterOptions<undefined>): Promise<Response> {
                options.response.body += "D";
                return options.response;
              }
            })(),
          ],
        });

        let res;

        res = await router.resolve({
          path: "/",
          httpMethod: "GET",
          queryStringParameters: {
          },
        } as any, { requestId: "request-id", timeout: 10000 });

        expect(res.body).to.eq("ABDC");

        // should preserve middleware order
        res = await router.resolve({
          path: "/",
          httpMethod: "GET",
          queryStringParameters: {
          },
        } as any, { requestId: "request-id", timeout: 10000 });

        expect(res.body).to.eq("ABDC");
      });
    });

    it("should raise timeout if it's really get delayed", async () => {
      const router = new Router([
        new Namespace("/", {}, {
          async exceptionHandler(error: Error) {
            if (error instanceof TimeoutError) {
              return this.json({
                error: "Timeout",
                operationId: error.route.operationId,
              }, 500);
            }
          },
          children: [
            Route.GET("", { operationId: "getIndex" }, {}, async function() {
              await new Promise<void>((resolve) => {
                setTimeout(() => {
                  resolve();
                }, 200);
              });

              return this.json({});
            }),
          ],
        }),
      ]);
      const handler = router.handler();

      const res = await handler(
        {
          path: "/",
          httpMethod: "GET",
          queryStringParameters: {
          },
        } as any,
        {
          getRemainingTimeInMillis() {
            return 100;
          },
          awsRequestId: "request-id",
        } as any
      );

      expect(res).to.deep.eq({
        statusCode: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          error: "Timeout",
          operationId: "getIndex",
        }),
      });
    });
  });
});
