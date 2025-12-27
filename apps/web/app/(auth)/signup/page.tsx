"use client";
import { Spinner } from "@web/components/ui/spinner";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";




const SignUp=()=>{
   const router=useRouter()
   const [loading,setLoading]=useState(false);

   const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const form=new FormData(e.currentTarget);
      const username=form.get("username");
      const email=form.get("email");
      const password=form.get("password");
      setLoading(true);

     try {
       const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
       const signUpResponse = await axios.post(
					`${BACKEND_URL}/api/auth/signup`,
					{ username, email, password },
					{ withCredentials: true }
				);
        setLoading(false);

            if(signUpResponse){
               router.push("/signin")
            }

           
     } catch (error) {
      setLoading(false);
      console.log(error,"error in the signup");
      const message = axios.isAxiosError(error)
				? error.response?.data.message
				: "Unknown error";
      toast.error("Sign up failed",{ description: message });
     }
   }


   return (
			<div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-black/70 transition-colors duration-300">
				<form
					onSubmit={handleSubmit}
					className="w-full max-w-md bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-700 p-8 rounded-lg shadow-md space-y-6 transition-colors duration-300"
				>
					<h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">
						Sign Up
					</h1>

					<div className="flex flex-col">
						<label
							htmlFor="username"
							className="text-gray-700 dark:text-gray-200 mb-2"
						>
							Username
						</label>
						<input
							type="text"
							name="username"
							placeholder="Enter your name"
							className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
							required
						/>
					</div>

					<div className="flex flex-col">
						<label
							htmlFor="email"
							className="text-gray-700 dark:text-gray-200 mb-2"
						>
							Email
						</label>
						<input
							type="email"
							name="email"
							placeholder="Enter your email"
							className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
							required
						/>
					</div>

					<div className="flex flex-col">
						<label
							htmlFor="password"
							className="text-gray-700 dark:text-gray-200 mb-2"
						>
							Password
						</label>
						<input
							type="password"
							name="password"
							placeholder="Enter your password"
							className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
							required
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 px-4 rounded-md bg-blue-600 dark:bg-blue-500 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300
             flex items-center justify-center"
					>
						{loading ? <Spinner /> : "Sign Up"}
					</button>
					<p className="text-gray-400 flex justify-center gap-2">
						Already have a Account{" "}
						<Link href={"/signin"} className="text-blue-500 underline  ">
							SignIn
						</Link>
					</p>
				</form>
			</div>
		);
}
export default SignUp;