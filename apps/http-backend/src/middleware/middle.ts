import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { siginSchema, SignInSchema } from "@repo/types";
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
      const decode=jwt.verify(token,process.env.JWT_SECRET!) as JwtPayload;
      if(!decode.id){
         throw new Error("unauthenticated user");
      }
      req.userId=decode.id;

      next();
   } catch (error:any) {
      res.status(400).json({message:"request received",error:error.message})
   }
}