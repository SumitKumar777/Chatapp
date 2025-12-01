import { describe, expect, test, vi } from "vitest";
import request from "supertest";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";

vi.mock("@repo/db", () => {
  return {
    default: mockDeep<PrismaClient>(),
  };
});

import { app } from "../index.js";
import prisma from "@repo/db";

const prismaMock = vi.mocked(prisma) as DeepMockProxy<PrismaClient>;

describe("/server running endpoint", () => {
  test("the get endpoint return test", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "request received" });
  });
});

describe("POST /signup endpoint", () => {
  test("signup working test", async () => {
    prismaMock.user.create.mockResolvedValueOnce({
      id: "1",
      username: "sumit",
      email: "sumitmehtaa@gmail.com",
      password: "hashedpassword",
      createdAt: new Date(),
    });

    vi.spyOn(prismaMock.user,"create");

    await request(app)
      .post("/api/auth/signup")
      .send({
        username: "sumit",
        email: "sumitmehtaa@gmail.com",
        password: "23232sdf",
      })
      .expect(201)
      .expect({ message: "user Created" });

    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        username: "sumit",
        email: "sumitmehtaa@gmail.com",
        password: expect.any(String),
      },
    });
  });
});
