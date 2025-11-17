import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import jwt, { JwtPayload } from "jsonwebtoken"


if (!process.env.JWT_SECRET){
   const dotenv=await import("dotenv");
   dotenv.config();
}
const JWT_SECRET=process.env.JWT_SECRET as string;

export async function GET() {
   const cookieStore = await cookies();
   const token = cookieStore.get("Authorization")?.value ?? " " ;
   let id: JwtPayload | null = null;

   if (token) {
      try {
         id = jwt.verify(token, JWT_SECRET) as JwtPayload;
      } catch (err) {
         console.error("Invalid token:", err);
         id = null;
      }
   }
   


   return NextResponse.json({ token: token || null,id });
}
