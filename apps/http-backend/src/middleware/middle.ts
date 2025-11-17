import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

if(!process.env.JWT_SECRET){
   const dotenv=await import("dotenv");
   dotenv.config();
}     




declare global {
  namespace Express {
    interface Request {
      userId?: string; 
      username:string;
      
    }
  }
}

export function authUser(req:Request<{},{},{}>,  res:Response, next: NextFunction) {
   try {
      const token = req.cookies.Authorization;
      console.log("auth token",token)

      const decode=jwt.verify(token,process.env.JWT_SECRET || "this is secret") as JwtPayload;
      console.log(decode,"decode in authuser");
      if(!decode.id){
         throw new Error("unauthenticated user");
      }

      console.log(decode,"decode in the authuser middleware ");

      req.userId=decode.id;
      req.username=decode.username;

      next();
   } catch (error:any) {
      console.log("error in auth user middleware",error.message);
      res.status(400).json({message:"request received",error:error.message})
   }
}