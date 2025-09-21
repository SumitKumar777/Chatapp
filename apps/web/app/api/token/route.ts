import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {  JWT_SECRET } from "@repo/types";
import jwt, { JwtPayload } from "jsonwebtoken"

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
