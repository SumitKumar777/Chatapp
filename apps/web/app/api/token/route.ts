import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
   const cookieStore = await cookies();
   const token = cookieStore.get("Authorization")?.value ?? " " ;
   cookieStore.set("auth", token,{
      expires: new Date(Date.now() + 86400 * 1000), 
      path: '/',
      httpOnly: true, 
      secure: false, 
   })

   return NextResponse.json({ token: token || null });
}
