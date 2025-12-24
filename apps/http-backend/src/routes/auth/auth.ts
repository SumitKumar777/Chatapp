
import express, { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "@repo/db";
import { siginSchema, SignUpSchema, signupSchema } from "@repo/types";
import bcrypt from "bcrypt";




export const authRouter:Router=express.Router();


const JWT_SECRET = process.env.JWT_SECRET;


export const hashPassword=(password:string):Promise<string>=>{

   return bcrypt.hash(password,10);
}

const comparePassword=(password:string,hash:string):Promise<boolean>=>{
   return bcrypt.compare(password,hash);
}



authRouter.post("/signup", async (req, res) => {
   try {
      const body = req.body;

      const parsed = signupSchema.safeParse(body);
      if (!parsed.success) {
         return res.status(400).json({ message: "invalid request body", error: parsed.error?.message })
      }
      const { username, email, password }: SignUpSchema = parsed.data;

      const foundUser= await prisma.user.findUnique({
         where:{
            email:parsed.data.email
         }
      })

      if(!foundUser){
         const hashedPassword = await hashPassword(password);

         await prisma.user.create({
            data: {
               username,
               email,
               password: hashedPassword
            }
         });

      }
     
      res.status(201).json({ message: "user Created" });

   } catch (error: any) {
      console.log(error, "error in the signup");
      res.status(500).json({ message: "unexcepted error in signup", error: error.message });
   }
})

authRouter.post("/signin", async (req, res) => {
   try {
      const body = req.body;
      const parsed = siginSchema.safeParse(body);
      if (!parsed.success) {
         return res.status(400).json({message:"invalid request body",error:parsed.error?.message})
      }
      const foundUser = await prisma.user.findUnique({
         where: {
            email: parsed.data.email
         }
      })

      if (!foundUser) {
         return res.status(404).json({ message: "user not found", error: "Unable to find user in database" })
      }

      if( !await comparePassword(parsed.data.password,foundUser.password)){
         return res.status(401).json({ message: "incorrect password", error: "password didn't match " })
      }

      const id = foundUser.id;
      const username = foundUser.username;

      const token = jwt.sign({ id, username }, JWT_SECRET as string, { expiresIn: '7d' });


      return res.status(200).cookie("Authorization", token, {
         maxAge: 7 * 24 * 60 * 60 * 1000,
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
      }).json({ message: "user found signin success"});

   } catch (error: any) {
      console.log("error in signin",error)
      return res.status(500).json({ message: "unexcepted error in signin", error: error.message })
   }
});