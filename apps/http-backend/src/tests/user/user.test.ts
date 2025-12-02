import { describe,expect,test } from "vitest";
import request from "supertest";
import { app } from "../../index.js";

import { getAgent } from "../setup.js";

describe("GET /getuserDetails endpoint",()=>{

    test(" check getting  without cookie user details",async()=>{
       const req = await request(app).get("/api/user/getUserDetail")
       expect(req.status).toBe(400); 
    })

    test("Check getting user details with cookie",async()=>{
       const req = await getAgent().get("/api/user/getUserDetail")
       expect(req.status).toBe(200); 
    })
})

