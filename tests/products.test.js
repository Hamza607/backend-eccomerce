const request = require("supertest");

const app = require("../src/app");

describe("Product API", () => {
  test("GET /api/products should return products", async () => {
    const response = await request(app).get("/api/products");

    expect(response.statusCode).toBe(200);
    expext(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data).toBe(true));
  });
});
