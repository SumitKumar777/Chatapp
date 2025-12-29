import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import jwt, { JwtPayload } from "jsonwebtoken"


if (!process.env.JWT_SECRET){
   const dotenv=await import("dotenv");
   dotenv.config();
}
const JWT_SECRET=process.env.JWT_SECRET as string;


export async function GET() {
   try {
      const cookieStore = await cookies();
      const token = cookieStore.get("Authorization")?.value;
      let id: JwtPayload | null = null;


      if(!token){
         throw new Error("token is not present")
      }

      if (token) {
         try {
            id = jwt.verify(token, JWT_SECRET) as JwtPayload;
            console.log("Verified token id: in internal", id);
         } catch (err) {
            console.error("Invalid token:", err);
            id = null;
            throw new Error("invalid token");
         }
      }



      return NextResponse.json({ token: token , id });
   } catch (error) {
      console.log("error in internal Token parser",error);
      return NextResponse.json({token:null,id:null})
   }
}
