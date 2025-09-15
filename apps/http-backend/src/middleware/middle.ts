import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, siginSchema, SignInSchema } from "@repo/types";
import dotenv from "dotenv"
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authUser(req:Request<{},{},SignInSchema>,  res:Response, next: NextFunction) {
   try {
      const token = req.cookies.Authorization;
      console.log("auth token",token)

      const decode=jwt.verify(token,JWT_SECRET) as JwtPayload;
      console.log(decode,"decode in authuser");
      if(!decode.id){
         throw new Error("unauthenticated user");
      }

      req.userId=decode.id;

      next();
   } catch (error:any) {
      res.status(400).json({message:"request received",error:error.message})
   }
}