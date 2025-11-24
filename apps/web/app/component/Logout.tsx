"use server";
import { cookies } from "next/headers";



async function Logout() {
   const cookieStore = await cookies();
   cookieStore.delete("Authorization");
   console.log("Cookie deleted on logout");
}

export default Logout;