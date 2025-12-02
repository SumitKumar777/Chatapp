import { describe, expect, test } from "vitest";
import { getAgent } from "../setup.js";
import { app } from "../../index.js";
import request from "supertest";




describe("POST room endpoint tests",()=>{

   let roomId:string;

   test("check room creation",async()=>{
      const req = await getAgent().post("/api/room/createroom").send({
         roomName:"integration"
      }).expect(200)

      roomId=req.body.data.id
   })

   test("check room details without giving roomid", async () => {
      const req = await getAgent().get("/api/room/detail").expect(400)
      expect(req.body.message).toBe("roomId is not present in roomDetails  request api")
   })

   test("check room details",async()=>{
      const req=await getAgent().get(`/api/room/detail?roomId=${roomId}`).expect(200);
   })

   test("check join room endpoint",async()=>{

      const userAgent2=request.agent(app);


      const signupRes = await userAgent2.post("/api/auth/signup").send({
         username: "roomjoiner",
         email: "roomjoiner@example.com",
         password: "password123"
      }).expect(201);

      const signinRes = await userAgent2.post("/api/auth/signin").send({
         email: "roomjoiner@example.com",
         password: "password123"
      }).expect(200);

      const joinRes = await userAgent2.post("/api/room/joinroom").send({
         roomId: roomId
      }).expect(200);

      expect(joinRes.body.status).toBe("success");
   })


   test("check join room endpoint with invalid roomid",async()=>{

      const req = await getAgent().post("/api/room/joinroom").send({
         roomId: " "
      }).expect(400);

      expect(req.body.status).toBe("error");
   })


   test("check search room endpoint",async()=>{

      const req = await getAgent().get(`/api/room/searchRoom/integration`).expect(200);

      expect(req.body.status).toBe("success");
   })


   test("check search room  with no matching room",async()=>{

      const req = await getAgent().get(`/api/room/searchRoom/nomatch`).expect(200);

      expect(req.body.status).toBe("success");
      expect(req.body.data.length).toBe(0);
   })

   test("check leave room endpoint",async()=>{

      const req = await getAgent().delete("/api/room/leaveroom").send({
         roomId: roomId
      }).expect(200);

      expect(req.body.status).toBe("success");

   })

   test("check leave room endpoint with invalid roomid",async()=>{

      const req = await getAgent().delete("/api/room/leaveroom").send({
         roomId: " "
      }).expect(400);

      expect(req.body.status).toBe("error");

   })

   test("check leave room endpoint when user is not part of that room",async()=>{

      const req = await getAgent().delete("/api/room/leaveroom").send({
         roomId: roomId
      }).expect(404);

      expect(req.body.status).toBe("error");
      expect(req.body.message).toBe("no such room ");
   });



   test("check get all rooms endpoint",async()=>{

      const req = await getAgent().get("/api/room/getAllRooms").expect(200);

      expect(req.body.status).toBe("success");
   })

})