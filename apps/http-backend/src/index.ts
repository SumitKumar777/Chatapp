import express ,{ Express, json, Request, Response } from "express";
import { authUser } from "./middleware/middle.js";
import { siginSchema, SignUpSchema, signupSchema, createRoomSchema, JWT_SECRET } from "@repo/types";
import  cookieParser from "cookie-parser"
import bodyPaser from "body-parser"
import jwt from "jsonwebtoken";
import prisma from "../../../packages/db/dist/index.js";
import cors from "cors"

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


      res.status(200).cookie("Authorization", token, { maxAge: 90000, httpOnly: true ,secure:false,sameSite:"none"}).json({ message: "request received",foundUser });

   } catch (error:any) {
      res.json({ message: "request received", error:error.message }).status(400);
   }
});

app.post("/createroom",authUser,async(req:Request,res:Response)=>{
   try {
      const body = req.body;
      const parsed = createRoomSchema.safeParse(body);
      if (!parsed) {
         throw new Error("Invalid createRoom body")
      }
      const createRoom = await prisma.room.create({
         data: {
            userId: req.userId as string,
            roomName: body.roomName,
            adminId: req.userId as string,
         }
      })

      res.status(200).json({ message: "request received", createRoom });
   } catch (error:any) {
      console.log(error);
      res.status(400).json({message:"room not created ",error:error.message})
   }
})

app.listen(PORT, () => console.log(`the app is listening on port ${PORT}`))