import { Type } from "@catchfashion/typebox";
import { expect } from "chai";

import {
  Namespace,
  Parameter,
  Route,
  Router,
  Routes,
  ValidationError,
} from "../../index";

describe("Calling complex API", () => {
  it("should exist", async () => {
    const routes: Routes = [
      new Namespace("/api/:userId", {
        userId: Type.Number(),
      }, {
        children: [
          new Route({
            path: "/followers",
            method: "GET",
            operationId: "getFollowers",
            desc: "List of users that following me",
            async handler() {
              return this.json({
                data: {}
              });
            }}
          ),
          new Namespace("/followings", {}, {
            async before() {
              //
            },
            children: [
              Route.POST("", { operationId: "follow" }, {
                testId: Parameter.Query(Type.Number()),
                update: Parameter.Body(Type.Object({
                  fieldA: Type.Number(),
                })),
              }, async function() {
                const userId = this.params.userId;
                const testId = this.params.testId;

                return this.json({
                  testId,
                  userId,
                  update: this.params.update,
                });
              }),

              Route.PATCH("", { operationId: "patchFollow" }, {
                testId: Parameter.Query(Type.Number()),
              }, async function() {
                const userId = this.params.userId;
                const testId = this.params.testId;

                return this.json({
                  testId,
                  userId,
                });
              }),

              Route.DELETE("", { operationId: "unfollow" }, {}, async function() {
                const userId = this.params.userId;
                return this.json({ userId });
              }),
            ]
          })
        ]
      })
    ];

    const router = new Router(routes);
    expect(await router.resolve({
      path: "/api/33/followings",
      httpMethod: "POST",
      body: JSON.stringify({
        update: {
          fieldA: 12345,
          fieldB: 54321,
        }
      }),
      queryStringParameters: {
        testId: "12345",
        not_allowed_param: "xxx",
      }
    } as any, { timeout: 10000 })).to.deep.eq({
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        testId: 12345,
        userId: 33,
        update: {
          fieldA: 12345,
        }
      })
    });
    expect(await router.resolve({
      path: "/api/33/followings",
      httpMethod: "PATCH",
      queryStringParameters: { testId: "12345" }
    } as any, { timeout: 10000 })).to.deep.eq({
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        testId: 12345,
        userId: 33,
      })
    });
  });
});

describe("Calling complex API", () => {
  it("should pass parameters to child namespaces", async () => {
    const befores: any[] = [];
    const routes: Routes = [
      new Namespace("/a/:a", {
        a: Type.Number(),
      }, {
        async before() {
          befores.push({ a: this.params.a });
          this.params.foo = { a: this.params.a };
        },
        children: [
          new Namespace("/b/:b", {
            b: Type.Number(),
          }, {
            async before() {
              befores.push({ a: this.params.a, b: this.params.b });
              this.params.bar = { a: this.params.a, b: this.params.b };
            },
            children: [
              Route.GET("", { operationId: "get" }, {}, async function() {
                return this.json([
                  this.params.foo,
                  this.params.bar,
                ]);
              }),
            ]
          })
        ]
      })
    ];

    const router = new Router(routes);
    const res = await router.resolve({
      path: "/a/10/b/20",
      httpMethod: "GET"
    } as any, { timeout: 10000 });

    expect(res.statusCode).to.be.eq(200);
    expect(befores).to.deep.eq([
      {
        a: 10,
      }, {
        a: 10,
        b: 20,
      }
    ]);
    expect(JSON.parse(res.body)).to.be.deep.eq([
      {
        a: 10,
      }, {
        a: 10,
        b: 20,
      }
    ]);
  });
});

describe("Global Error Handling", () => {
  it("should fail, and handled by parent namespace error handler", async () => {
    const routes: Routes = [
      new Namespace("/api", {}, {
        async exceptionHandler(error: any) {
          if (error instanceof ValidationError) {
            return this.json(
              {
                errors: error.details.map(e => e.message),
              },
              422
            );
          }
        },
        children: [
          new Namespace("/users/:userId", {
            userId: Type.Number(),
          }, {
            children: [
              Route.GET("", { operationId: "getUser" }, {
                testId: Parameter.Query(Type.Number()),
                otherError: Parameter.Query(Type.Number()),
              }, async function() {
                const userId = this.params.userId;
                const testId = this.params.testId;
                return this.json({
                  testId,
                  userId,
                });
              })
            ]
          })
        ]
      })
    ];

    const router = new Router(routes);
    const res = await router.resolve({
      path: "/api/users/12345",
      httpMethod: "GET",
      queryStringParameters: {
      }
    } as any, { timeout: 10000 });

    expect(res).to.deep.eq({
      statusCode: 422,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        errors: [
          "should have required property 'testId'",
          "should have required property 'otherError'",
        ],
      }),
    });
  });
});
