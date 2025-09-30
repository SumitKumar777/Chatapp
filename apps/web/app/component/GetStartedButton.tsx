"use client";
import Button from "./Button";

import { useRouter } from "next/navigation";

function GetStarted() {
   const router=useRouter()
   return (
			<Button
				type="button"
				className="font-semibold bg-blue-900 text-xl text-gray-300 px-6 py-3 rounded-lg hover:bg-blue-800"
            onClick={()=>router.push("/signup")}
			>
				Get Started
			</Button>
		);
}

export default GetStarted;