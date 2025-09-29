import { NextResponse,NextRequest } from "next/server";



export function middleware(req:NextRequest){

  const allCookies=req.cookies.get("Authorization");

  const authPage=["/signin","/signup"]



  if(!allCookies?.value){

    
    if (authPage.includes(req.nextUrl.pathname)){
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/signin",req.url));
  }

  if(authPage.includes(req.nextUrl.pathname) ){
    return NextResponse.redirect(new URL("/dashboard",req.url))
  }

  return NextResponse.next();

}

export const config={
  matcher:[
    "/dashboard",
    "/signin",
    "/signup"
  ]
}