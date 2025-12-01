import { afterAll, describe, expect, test } from "vitest";
import request from "supertest"
import { app } from "../../index.js";



describe("POST /signup endpoint", () => {
  
   test("signup working test", async () => {
      await request(app)
         .post("/api/auth/signup")
         .send({
            username: "sumit",
            email: "sumitmehtaa@gmail.com",
            password: "23232sdf",
         })
         .expect(201)
         .expect({ message: "user Created" });
   });
});


describe("POST /signin endpoint",()=>{

 
   test("checks on invalid input",async ()=>{
      const req=await request(app).post("/api/auth/signin").send(
         {
            email:"sumitmehtaagmail.com",
            password:"7999"
         }
      ).expect(400);

      expect(req.body.message).toBe("invalid request body")
   })

   test("check on user not present",async()=>{
      const req=await request(app).post("/api/auth/signin").send({
         email:"sumitking@gmail.com",
         password:"thisPassword"
      })
   })

   test("checks on invalid password",async()=>{
      const req= await request(app).post("/api/auth/signin").send({
         email:"sumitmehtaa@gmail.com",
         password:"343dds"
      }).expect(401)

      expect(req.body.message).toBe("incorrect password")
   })

   test("check on signin and delete user",async()=>{
      const req=await request(app).post("/api/auth/signin").send({
         email: "sumitmehtaa@gmail.com",
         password: "23232sdf",
      }).expect(200)

      const rawCookies = req.headers['set-cookie'];

      if (!rawCookies) throw new Error("No cookies returned");


      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];

      const tokenCookie = cookies.find(c => c.startsWith('Authorization='));
      if (!tokenCookie) throw new Error("Authorization cookie missing");

      const token = tokenCookie.split('=')[1].split(';')[0];

      expect(req.body.message).toBe("user found signin success");

      await request(app)
         .delete("/api/user/deleteuser")
         .set('Cookie', `Authorization=${token}`)
         .expect(204);

    
   })



})