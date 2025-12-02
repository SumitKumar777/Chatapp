import { describe, expect, test } from "vitest";
import request from "supertest";
import { app } from "../../index.js";

let agent = request.agent(app);

describe("POST /signup endpoint", () => {
  test("signup working test", async () => {
    await agent
      .post("/api/auth/signup")
      .send({
        username: "sumitt",
        email: "sumittmehtaa@gmail.com",
        password: "23232sdf",
      })
      .expect(201)
      .expect({ message: "user Created" });
  });
});

describe("POST /signin endpoint", () => {
  test("checks on invalid input", async () => {
    const req = await agent
      .post("/api/auth/signin")
      .send({
        email: "sumitmehtaagmail.com",
        password: "7999",
      })
      .expect(400);

    expect(req.body.message).toBe("invalid request body");
  });

  test("check on user not present", async () => {
    const req = await agent
      .post("/api/auth/signin")
      .send({
        email: "sumitadfsdfking@gmail.com",
        password: "thisPassword",
      })
      .expect(404);

     expect(req.body.message).toBe("user not found");
  });

  test("checks on invalid password", async () => {
    const req = await agent
      .post("/api/auth/signin")
      .send({
        email: "sumittmehtaa@gmail.com",
        password: "343dds",
      })
      .expect(401);

     expect(req.body.message).toBe("incorrect password");
  });

  test("check on signin", async () => {
    const req = await agent
      .post("/api/auth/signin")
      .send({
        email: "sumittmehtaa@gmail.com",
        password: "23232sdf",
      })
      .expect(200);
  });
});

export default agent;
