import {
  Route,
  RoutingContext,
  Namespace,
  Routes,
  Router,
  Parameter,
  Middleware,
  MiddlewareBeforeOptions,
  MiddlewareAfterOptions,
  Response,
} from '../index';
import * as Joi from 'joi';


import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Router", () => {
  describe("#constructor", () => {
    it("should raise error if there is duplicated operationId", () => {
      expect(() => {
        const router = new Router([
          Route.GET('/', { operationId: "getIndex" }, {}, async function () {
            return this.json("");
          }),
          Route.GET('/wrong-path', { operationId: "getIndex" }, {}, async function () {
            return this.json("");
          })
        ]);
      }).to.throw(Error, "route has duplicated operationId: \"getIndex\"");
    });
  });

  describe("#handler", () => {
    describe("middlewares", () => {
      it("should run middlewares one by one in order", async () => {
        const router = new Router([
          Route.GET('/', { operationId: "getIndex" }, {}, async function() {
            return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json; charset=utf-8' },
              body: this.request.body!,
            };
          })
        ], {
          middlewares: [
            new (class TestMiddleware implements Middleware {
              async before(options: MiddlewareBeforeOptions<undefined>): Promise<Response | void> {
                options.routingContext.request.body = "A";
              }
              async after(options: MiddlewareAfterOptions<undefined>): Promise<Response> {
                options.response.body += "C";
                return options.response;
              }
            }),
            new (class TestMiddleware implements Middleware {
              async before(options: MiddlewareBeforeOptions<undefined>): Promise<Response | void> {
                options.routingContext.request.body += "B";
              }
              async after(options: MiddlewareAfterOptions<undefined>): Promise<Response> {
                options.response.body += "D";
                return options.response;
              }
            }),
          ]
        });

        let res;

        res = await router.resolve({
          path: '/',
          httpMethod: 'GET',
          queryStringParameters: {
          },
        } as any, "request-id");

        expect(res.body).to.eq("ABDC");

        // should preserve middleware order
        res = await router.resolve({
          path: '/',
          httpMethod: 'GET',
          queryStringParameters: {
          },
        } as any, "request-id");

        expect(res.body).to.eq("ABDC");
      });
    });

    it("should raise timeout if it's really get delayed", async () => {
      const router = new Router([
        Route.GET('/', { operationId: "getIndex" }, {}, async function() {
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve();
            }, 200);
          });

          return this.json({});
        })
      ]);
      const handler = router.handler();

      const res = await new Promise((resolve, reject) => {
        handler(
          {
            path: '/',
            httpMethod: 'GET',
            queryStringParameters: {
            },
          } as any,
          {
            succeed: function(result?: Object) {
              this.done(undefined, result);
            },
            fail: function(error: Error) {
              this.done(error);
            },
            done: function(error: Error | null, result?: Response) {
              resolve(error || result);
            },
            getRemainingTimeInMillis: function() {
              return 100;
            },
            awsRequestId: "request-id",
          } as any
        );
      });

      // chai.expect(res).to.deep.eq({
      //   statusCode: 500,
      //   headers: { 'Content-Type': 'application/json; charset=utf-8' },
      //   body: JSON.stringify({
      //     "error":{"id":"request-id","message":"Service timeout. {\"path\":\"/\",\"httpMethod\":\"GET\",\"queryStringParameters\":{},\"requestContext\":{\"requestId\":\"request-id\"}}"}
      //   }),
      // });
    });
  });
});
