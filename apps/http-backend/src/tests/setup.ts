import { beforeAll } from "vitest";
import prisma from "@repo/db";
import { app } from "../index.js";
import request from "supertest";
import { hashPassword } from "../routes/auth/auth.js";

let agent: any;

beforeAll(async () => {
  try {
    await prisma.user.create({
      data: {
        username: "kavyaaa",
        email: "kavyaagurung@gmail.com",
        password: await hashPassword("123sum"),
      },
    });
  } catch (e) {
    // handling unique constraint error
  }

  agent = request.agent(app);

  const req = await agent
    .post("/api/auth/signin")
    .send({
      email: "kavyaagurung@gmail.com",
      password: "123sum",
    })
    .expect(200);
});

export function getAgent() {
  return agent;
}
