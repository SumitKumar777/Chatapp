import { describe, expect, test } from "vitest";
import request from "supertest";;

import { app } from "../index.js";



describe("/server running endpoint", () => {
  test("the get endpoint return test", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "request received" });
  });
});


