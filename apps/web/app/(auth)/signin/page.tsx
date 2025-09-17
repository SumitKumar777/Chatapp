"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SignIn = () => {
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const email = form.get("email");
		const password = form.get("password");

		try {
			const signinResponse = await axios.post(
				"http://localhost:3001/signin",
				{
					email,
					password,
				},
				{
					
					withCredentials: true,
				}
			);

			console.log(signinResponse, "signinResponse");
         if(signinResponse.data){
            router.push("/dashboard");
         }
			
		} catch (error) {
			console.log(error, "error in the signup");
		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit} className="max-w-[300px] border-2 w-full space-y-4 mt-10 ">
				<label htmlFor="email">email</label>
				<br />
				<input type="email" name="email" placeholder="Enter your email"  className="border-1"/>
				<br />
				<label htmlFor="password">password</label>
				<br />
				<input
					type="password"
					name="password"
					placeholder="Enter your password"
					className="border-1"
				/>
				<br />


				<button type="submit">Signin</button>
				<br />
				<Link href={"/signup"}>Go to Signup</Link>
			</form>
		</div>
	);
};

export default SignIn;
