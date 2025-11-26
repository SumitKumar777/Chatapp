
import express, { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "@repo/db";
import { siginSchema, SignUpSchema, signupSchema } from "@repo/types";


export const authRouter:Router=express.Router();


const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET, "jwt secret in auth route");


authRouter.post("/signup", async (req, res) => {
   try {
      const body = req.body;
      const parsed = signupSchema.safeParse(body);
      if (!parsed.success) {
         throw Error("parsing failed");
      }
      const { username, email, password }: SignUpSchema = parsed.data;
      const createdUser = await prisma.user.create({
         data: {
            username,
            email,
            password
         }
      })
      res.status(200).json({ message: "user Created", createdUser });

   } catch (error: any) {
      console.log(error, "error in the signup");
      res.status(400).json({ message: "request received", error: error.message });
   }
})

authRouter.post("/signin", async (req, res) => {
   try {
      const body = req.body;
      const parsed = siginSchema.safeParse(body);
      if (!parsed.success) {
         throw Error("Invalid request body in signin");
      }
      const foundUser = await prisma.user.findUnique({
         where: {
            email: body.email
         }
      })
      if (!foundUser) {
         throw new Error("user not found");
      }
      const id = foundUser.id;
      const username = foundUser.username;

      const token = jwt.sign({ id, username }, JWT_SECRET as string, { expiresIn: '7d' });


      return res.status(200).cookie("Authorization", token, {
         maxAge: 7 * 24 * 60 * 60 * 1000,
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
      }).json({ message: "request received", foundUser });

   } catch (error: any) {
      return res.json({ message: "request received", error: error.message }).status(400);
   }
});