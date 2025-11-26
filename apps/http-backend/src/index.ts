import express ,{ Express, Request, Response } from "express";
import  cookieParser from "cookie-parser"
import bodyPasrer from "body-parser"
import "./config/env.js"

import cors from "cors";

import { authRouter } from "./routes/auth/auth.js";
import { userRouter } from "./routes/user/user.js";
import { roomRouter } from "./routes/room/room.js";
import { chatRouter } from "./routes/chat/chat.js";


export const app:Express=express();

app.use(cors({
   origin: process.env.FRONTEND_URL || "http://localhost:3000",
   credentials: true
}));


app.use(bodyPasrer.urlencoded({ extended: true }))
app.use(express.json());
app.use(cookieParser());



app.get("/",(req,res)=>{
   res.json({message:"request received"});
})


app.use("/api/auth",authRouter);

app.use("/api/user",userRouter);

app.use("/api/room",roomRouter);

app.use("/api/chat",chatRouter);




app.use((req:Request,res:Response)=>{
   res.status(404).json({status:"failed",message:"route not found"});
});

