import request from "supertest";
import { describe, expect, test } from "@jest/globals";
import app from "..";

jest.mock("../services/database_service", () => ({
  connectDatabase: jest.fn(),
}));

describe("successfully run the health API", () => {
  it("should run the APIs health check API and return success message", async () => {
    const response = await request(app).get("/app/health").expect(200);

    expect(response.body).toEqual({ message: "API's are healthy" });
  });
});
