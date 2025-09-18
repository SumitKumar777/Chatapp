import express ,{ Express, json, Request, Response } from "express";
import { authUser } from "./middleware/middle.js";
import { siginSchema, SignUpSchema, signupSchema, createRoomSchema, JWT_SECRET, joinRoom, roomMessage } from "@repo/types";
import  cookieParser from "cookie-parser"
import bodyPaser from "body-parser"
import jwt from "jsonwebtoken";
import prisma from "../../../packages/db/dist/index.js";
import cors from "cors";
import { client, connectClient } from "./routes/worker/redisClient.js";

import "./routes/worker/worker.js";


const app:Express=express();


app.use(cors({
   origin:"http://localhost:3000",
   credentials:true
}));


app.use(bodyPaser.urlencoded({ extended: true }))
app.use(express.json());
app.use(cookieParser());


const PORT = 3001;


app.get("/",(req,res)=>{
   
   res.json({message:"request received"}).status(200);
})

app.post("/signup",async(req,res)=>{
 try {
    const body = req.body;
    const parsed = signupSchema.safeParse(body);
    if(!parsed.success){
      throw Error("parsing failed");
    }
    const {username,email,password}:SignUpSchema=parsed.data;
    const createdUser = await prisma.user.create({
       data: {
          username,
          email,
          password
       }
    })
    res.status(200).json({message:"user Created",createdUser});
    
 } catch (error:any) {
   console.log(error ,"error in the signup");
    res.status(400).json({ message: "request received", error:error.message });
 }
})

app.post("/signin",async(req,res)=>{
   try {
      const body = req.body;
           const parsed = siginSchema.safeParse(body);
           if (!parsed.success) {
              throw Error("Invalid request body in signin");
           }
      const foundUser=await prisma.user.findUnique({
         where:{
            email:body.email
         }
      })
      if(!foundUser){
         throw new Error("user not found");
      }
      const id=foundUser.id;

      const token = jwt.sign({id}, JWT_SECRET);


      return res.status(200).cookie("Authorization", token, {
         maxAge: 7*24*60*60*1000,
         httpOnly: true,
         secure: false,
         sameSite: "lax", 
      }).json({ message: "request received",foundUser });

   } catch (error:any) {
      return res.json({ message: "request received", error:error.message }).status(400);
   }
});

app.post("/createroom",authUser,async(req:Request,res:Response)=>{
   try {
      const body = req.body;
      const parsed = createRoomSchema.safeParse(body);
      if (!parsed ) {
         throw new Error("Invalid createRoom body")
      }

      const userId=req.userId;
      if(!userId){
         throw new Error("user id in present createdroom");
      }
      const roomCreated=await prisma.$transaction(async(tx)=>{
         const room=await tx.room.create({
            data:{
               name:parsed.data?.roomName as string,
               createdById:userId as string
            }
         })
         const roomMem=await tx.roomMember.create({
            data:{
               roomId:room.id ,
               role:"admin",
               userId :userId as string
            }
         })
         return room;
      })
      return res.status(200).json({status:"success" ,message: "request received in create Room",data:roomCreated });
   } catch (error:any) {
      console.log("error in room creating",error);
      return res.status(400).json({status:"failed",message:"room not created ",error:error.message})
   }
})


// 	•	Get Room Details
// GET /api/rooms/:roomId
// Response: { id, name, members, createdBy }



interface RoomParams{
   roomId:string;
}

app.get("/room/detail/:roomId",authUser,async(req:Request<RoomParams>,res)=>{
   try {
      const roomId:string=req.params.roomId;
      if(!roomId){
         throw new Error("roomId is not present in roomDetails api")
      }
      const userId=req.userId;
      const roomDetail=await prisma.room.findUnique({
         where:{
            id:roomId
         }
      })
      if(!roomDetail){
         throw new Error("roomDetails not fetched");
      }
      return res.status(200).json({status:"success",message:"room details fetched",data:roomDetail});
   } catch (error:unknown ) {
      if(error instanceof Error){
         console.log("error in the roomDetails",error.message);
         return res.status(500).json({status:"error",message:error.message})
      }else{
         console.log("unexpected error in the room details",error);
         return res.status(500).json({status:"error",message:"unexpected error in the roomdetails"});
      }
   }
})


// 4. Real-time Features

// (Mostly handled by WebSockets, but you may still want REST for fallback/audit)

// 	•	Join Room
// POST /api/rooms/:roomId/join
// Response: { message: "Joined room" }


app.post("/joinroom",authUser,async(req:Request<RoomParams>,res:Response)=>{
   try {
      const body=req.body;
      const parsed=joinRoom.safeParse(body);
      if(!parsed.success){
         throw new Error("invalid request body");
      }
      const userId=req.userId;
      // Check if the user is already in teh room

      const foundUser=await prisma.roomMember.findFirst({
         where:{
            roomId:parsed.data.roomId as string,
            userId:userId as string
         }
      })
      let joinUser;
      if(!foundUser){
         joinUser=await prisma.roomMember.create({
            data:{
               roomId:parsed.data.roomId,
               userId:userId as string
            }
         })
         return res.status(200).json({status:"succes",message:"user added to room",data:joinUser})
      }
      return res.status(200).json({ status: "succes", message: "user added to room", data: foundUser })

   } catch (error: unknown) {
      if (error instanceof Error) {
         console.log("error in the joining room", error.message);
         return res.status(500).json({ status: "error", message: error.message })
      } else {
         console.log("unexpected error in the joinRoom ", error);
         return res.status(500).json({ status: "error", message: "unexpected error in the joinRoom" });
      }
   }
})


// 	•	Leave Room
// POST /api/rooms/:roomId/leave
// Response: { message: "Left room" }

// ⸻

app.delete(
   "/leaveroom",
   authUser,
   async (req: Request, res: Response) => {
      try {
         const body=req.body;
         const parsed=joinRoom.safeParse(body);
         if(!parsed.success){
            throw new Error("Invalid leave room request body");
         }

         const userId=req.userId;

         const deletedMember = await prisma.roomMember.deleteMany({
            where: {
               roomId: parsed.data.roomId,
               userId: userId,
            },
         });

         if (deletedMember.count === 0) {
            return res.status(404).json({ message: "You are not a member of this room" });
         }

         return res.status(200).json({ message: "Left room successfully" });
      } catch (error) {
         if (error instanceof Error) {
            console.log("error in the leaving room", error.message);
            return res.status(500).json({ status: "error", message: error.message })
         } else {
            console.log("unexpected error in the joinRoom ", error);
            return res.status(500).json({ status: "error", message: "unexpected error in the leaving room" });
         }
      }
   }
);


// also check is this user member of this room who is sending message for security 


app.post("/message",authUser,async(req:Request,res:Response)=>{
   try {
      const data = req.body;
      const parsed=roomMessage.safeParse(data);
      if(!parsed.success){
         throw new Error("Invalid request body in message body ");
      }
      const userId=req.userId;
      // Stored in the database 
      // put this in queue

      const {roomId,message}=parsed.data;
      await connectClient();

      await client.lPush("chatMessage",JSON.stringify({userId,roomId,message}));

   
      
      return res.status(200).json({status:"success",message:"message sent to websocket"})

   } catch (error:unknown) {
      if(error instanceof Error){
         console.log("error in sending message",error.message);
         return res.status(500).json({status:"error",message:error.message})
      }else{
         console.log("error in sending message", error);
         return res.status(500).json({ status: "error", message: "unexpected error happend in sending message" })
      }
   }
})


async function startServer(){
  try {
   await connectClient();
     app.listen(PORT, () => console.log(`app is listening on port ${PORT}`))
  } catch (error) {
   console.log("error in connecting starting the server",error)
  }
}


startServer();