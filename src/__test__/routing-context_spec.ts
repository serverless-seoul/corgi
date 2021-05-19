import { Type } from "@serverless-seoul/typebox";
import { expect } from "chai";

import * as qs from "qs";
import { Parameter } from "../parameter";
import { RoutingContext } from "../routing-context";

describe("RoutingContext", () => {
  describe("#validateAndUpdateParams", () => {
    context("when body is valid JSON", () => {
      it("should parse and validate JsonBody params", () => {
        const context = new RoutingContext({} as any, {
          path: "/api/33/followings/%ED%94%BD%EC%8B%9C",
          httpMethod: "POST",
          body: JSON.stringify({
            update: {
              fieldA: 12345,
              fieldB: 54321,
              fieldC: {
                c: 100,
              },
              fieldUnknown: false,
            },
            unknownBodyParam: "foo",
          }),
          queryStringParameters: {
            "testId": "12345",
            "not_allowed_param": "xxx",
            "encodedParam": "픽시",
            "arrayParameter[0]": "1",
            "arrayParameter[1]": "2",
            "arrayParameter[2]": "3",
            "arrayParameter[3]": "4",
            "unknownQueryParam": "aaa",
            "queryString": JSON.stringify({ foo: 123 }),
            "queryObject": JSON.stringify({ foo: "a", bar: 1 }),
            "queryUnion": JSON.stringify({ type: "bar", bar: 3 }),
            "queryArray": JSON.stringify([{
              a: "aaa",
              b: 1,
              c: true,
              d: null,
              e: "e",
            }, {
              a: "aaa",
              b: 1,
              c: true,
              d: null,
            }]),
          }
        } as any, "request-id", {
          userId: "33",
          interest: "%ED%94%BD%EC%8B%9C",
        });

        context.validateAndUpdateParams({
          testId: Parameter.Query(Type.Number()),
          encodedParam: Parameter.Query(Type.String()),
          queryString: Parameter.Query(Type.String()),
          queryObject: Parameter.Query(Type.Object({
            foo: Type.String(),
            bar: Type.Integer(),
            baz: Type.Optional(Type.Boolean()),
          })),
          queryUnion: Parameter.Query(Type.Union([
            Type.Object({
              type: Type.Literal("foo"),
              foo: Type.String(),
            }),
            Type.Object({
              type: Type.Literal("bar"),
              bar: Type.Number(),
            }),
          ])),
          queryArray: Parameter.Query(Type.Array(Type.Object({
            a: Type.String(),
            b: Type.Integer(),
            c: Type.Boolean(),
            d: Type.Null(),
            e: Type.Optional(Type.Literal("e")),
          }))),
          update: Parameter.Body(Type.Object({
            fieldA: Type.Number(),
            fieldC: Type.Object({
              c: Type.Number()
            })
          })),
          userId: Parameter.Path(Type.Number()),
          interest: Parameter.Path(Type.String()),
          arrayParameter: Parameter.Query(Type.Array(Type.Integer())),
        });

        expect(context.params).to.deep.eq({
          testId: 12345,
          encodedParam: "픽시",
          update: {
            fieldA: 12345,
            fieldC: {
              c: 100,
            }
          },
          userId: 33,
          interest: "픽시",
          arrayParameter: [1, 2, 3, 4],
          queryString: JSON.stringify({ foo: 123 }),
          queryObject: { foo: "a", bar: 1 },
          queryUnion: { type: "bar", bar: 3 },
          queryArray: [{
            a: "aaa",
            b: 1,
            c: true,
            d: null,
            e: "e",
          }, {
            a: "aaa",
            b: 1,
            c: true,
            d: null,
          }],
        });
      });

      it("should parse and validate multiple value parameters in querystring", () => {
        // ?a=[1,2]
        // ?b[0]=1&b[1]=2
        // ?c[]=1&c[]=2
        // ?d=1&d=2
        const context = new RoutingContext({} as any, {
          path: "/api",
          httpMethod: "GET",
          queryStringParameters: {
            "a": "[1, 2]",
            "b[0]": "1",
            "b[1]": "2",
            "c[]": "2",
            "d": "2",
          },
          multiValueQueryStringParameters: {
            "a": [
              "[1, 2]"
            ],
            "b[0]": [
              "1"
            ],
            "b[1]": [
              "2"
            ],
            "c[]": [
              "1",
              "2",
            ],
            "d": [
              "1",
              "2",
            ]
          }
        } as any, "request-id", {});

        context.validateAndUpdateParams({
          a: Parameter.Query(Type.Array(Type.String())),
          b: Parameter.Query(Type.Array(Type.String())),
          c: Parameter.Query(Type.Array(Type.String())),
          d: Parameter.Query(Type.Array(Type.String())),
        });

        expect(context.params).to.deep.eq({
          a: ["1", "2"],
          b: ["1", "2"],
          c: ["1", "2"],
          d: ["1", "2"],
        });
      });

      it("should parse and validate application/x-www-form-urlencoded params", () => {
        const context = new RoutingContext({} as any, {
          path: "/api/33/followings/%ED%94%BD%EC%8B%9C",
          httpMethod: "POST",
          body: qs.stringify({
            update: {
              fieldA: 12345,
              fieldB: 54321,
              fieldC: {
                c: 100,
              }
            }
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          queryStringParameters: {
            "testId": "12345",
            "not_allowed_param": "xxx",
            "encodedParam": "픽시",
            "arrayParameter[0]": "1",
            "arrayParameter[1]": "2",
            "arrayParameter[2]": "3",
            "arrayParameter[3]": "4",
          }
        } as any, "request-id", {
            userId: "33",
            interest: "%ED%94%BD%EC%8B%9C",
          });

        context.validateAndUpdateParams({
          testId: Parameter.Query(Type.Number()),
          encodedParam: Parameter.Query(Type.String()),
          update: Parameter.Body(Type.Object({
            fieldA: Type.Number(),
            fieldC: Type.Object({
              c: Type.Number()
            })
          })),
          userId: Parameter.Path(Type.Number()),
          interest: Parameter.Path(Type.String()),
          arrayParameter: Parameter.Query(Type.Array(Type.Integer())),
        });

        expect(context.params).to.deep.eq({
          testId: 12345,
          encodedParam: "픽시",
          update: {
            fieldA: 12345,
            fieldC: {
              c: 100,
            }
          },
          userId: 33,
          interest: "픽시",
          arrayParameter: [1, 2, 3, 4],
        });
      });

      it("should parse and validate JsonBody params when path has % character", () => {
        const context = new RoutingContext({} as any, {
          path: "/api/33/followings/100%users",
          httpMethod: "POST",
          body: JSON.stringify({
            update: {
              fieldA: 12345,
              fieldB: 54321,
              fieldC: {
                c: 100,
              }
            }
          }),
          queryStringParameters: {
            "testId": "12345",
            "not_allowed_param": "xxx",
            "encodedParam": "100%users",
            "doubleEncodedParam": "vingle%3A%2F%2Finterests%2F%EB%B9%99%EA%B8%80%EB%9F%AC",
            "arrayParameter[0]": "1",
            "arrayParameter[1]": "2",
            "arrayParameter[2]": "3",
            "arrayParameter[3]": "4",
          }
        } as any, "request-id", {
          userId: "33",
          interest: "100%users",
        });

        context.validateAndUpdateParams({
          testId: Parameter.Query(Type.Number()),
          encodedParam: Parameter.Query(Type.String()),
          doubleEncodedParam: Parameter.Query(Type.String()),
          update: Parameter.Body(Type.Object({
            fieldA: Type.Number(),
            fieldC: Type.Object({
              c: Type.Number(),
            }),
          })),
          userId: Parameter.Path(Type.Number()),
          interest: Parameter.Path(Type.String()),
          arrayParameter: Parameter.Query(Type.Array(Type.Integer())),
        });

        expect(context.params).to.deep.eq({
          testId: 12345,
          encodedParam: "100%users",
          doubleEncodedParam: "vingle%3A%2F%2Finterests%2F%EB%B9%99%EA%B8%80%EB%9F%AC",
          update: {
            fieldA: 12345,
            fieldC: {
              c: 100,
            }
          },
          userId: 33,
          interest: "100%users",
          arrayParameter: [1, 2, 3, 4],
        });
      });
    });

    context("when body is null (which means empty request body)", () => {
      it("should parse and validate JsonBody params", () => {
        const context = new RoutingContext({} as any, {
          path: "/api/33/followings/%ED%94%BD%EC%8B%9C",
          httpMethod: "POST",
          body: null,
          queryStringParameters: null,
        } as any, "request-id", {
          userId: "33",
          interest: "%ED%94%BD%EC%8B%9C",
        });

        context.validateAndUpdateParams({
          update: Parameter.Body(
            Type.Optional(Type.Object({
              complex: Type.Union([
                Type.Array(Type.Number()),
                Type.Null(),
              ]),
            })),
          ),
        });

        expect(context.params).to.deep.eq({});
      });
    });
  });

  describe("#normalizeHeaders", () => {
    it("should normalize headers", () => {
      const context = new RoutingContext({} as any, {
        path: "/api/33/followings",
        httpMethod: "POST",
        body: JSON.stringify({ foo: "bar" }),
        headers: {
          "origin": "https://bar.baz",
          "User-Agent": "Googlebot/1.0",
        },
        queryStringParameters: null,
      } as any, "request-id", {});

      expect(context.headers).to.be.deep.eq({
        "origin": "https://bar.baz",
        "user-agent": "Googlebot/1.0",
      });
    });

    it("should be called lazily / should be cached", () => {
      const context = new RoutingContext({} as any, {
        path: "/api/wow/awesome",
        httpMethod: "POST",
        body: JSON.stringify({ such: "value" }),
        headers: {
          ETag: "abcdef",
          Host: "www.vingle.net",
        },
        queryStringParameters: null,
      } as any, "request-id", {});

      // HACK: setup trap for testing call count
      let callCount = 0;
      // backup original function reference
      const fn = (context as any).normalizeHeaders;

      const noop = (() => undefined) as any;

      // decorate target method to trap method calls
      (context as any).normalizeHeaders = function() {
        callCount++;
        return fn.apply(context, arguments);
      };

      // normalizeHeaders should be called lazily
      expect(callCount).to.be.eq(0);

      noop(context.headers);
      expect(callCount).to.be.eq(1);

      // ... and should be cached
      noop(context.headers);
      noop(context.headers);
      noop(context.headers);
      expect(callCount).to.be.eq(1);

      expect(context.headers).to.be.deep.eq({
        etag: "abcdef",
        host: "www.vingle.net",
      });
      expect(callCount).to.be.eq(1);
    });
  });

  describe("#bodyJSON", () => {
    context("when body is base64Encoded", () => {
      it("should return parsed body", () => {
        const body = JSON.stringify({
          update: {
            foo: {
              bar: "baz",
            },
          },
        });

        const context = new RoutingContext({} as any, {
          path: "/api/33/followings/%ED%94%BD%EC%8B%9C",
          httpMethod: "POST",
          body: Buffer.from(body, "utf8").toString("base64"),
          isBase64Encoded: true,
          queryStringParameters: null,
        } as any, "request-id", {
          userId: "33",
          interest: "%ED%94%BD%EC%8B%9C",
        });

        expect(context.bodyJSON).to.deep.eq({
          update: {
            foo: {
              bar: "baz",
            },
          },
        });
      });
    });
  });
});
