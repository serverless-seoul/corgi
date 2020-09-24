import { expect } from "chai";

import {
  Namespace,
  OpenAPIRoute,
  Router,
} from "../../index";
import { Routes, Schemas } from "./support";

import * as OpenAPIFixture from "./open_api_fixture.json";

describe("OpenAPI E2E Test", () => {
  let router: Router;

  beforeEach(() => {
    router = new Router([
      new Namespace("/api", {}, {
        children: [
          new OpenAPIRoute("/open-api", {
            title: "MyAPI",
            version: "1.0.0",
            definitions: Schemas,
          }, Routes),
          ...Routes,
        ],
      }),
    ]);
  });

  it("should return OpenAPI documentation", async () => {
    const res = await router.resolve({
      path: "/api/open-api",
      httpMethod: "GET",
      headers: {
        "Host": "api.example.net",
        "Origin": "https://foo.bar",
        "X-Forwarded-Proto": "https",
      },
      requestContext: {
        stage: "prod",
      },
    } as any, { requestId: "request-id", timeout: 10000 });

    expect(res.statusCode).to.eq(200);
    expect(JSON.parse(res.body)).to.deep.eq(OpenAPIFixture);
  });
});
