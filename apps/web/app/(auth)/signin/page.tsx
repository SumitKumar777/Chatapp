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

			console.log(signinResponse.headers, "signinResponse");
         if(signinResponse){
            router.push("/connect");
         }
			
		} catch (error) {
			console.log(error, "error in the signup");
		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				
				<label htmlFor="email">
					email
					<br />
					<input type="email" name="email" placeholder="Enter your email" />
				</label>
				<label htmlFor="password">
					password
					<br />
					<input
						type="password"
						name="password"
						placeholder="Enter your password"
					/>
				</label>
				<button type="submit">Signin</button>

            <Link href={"/signup"}>Go to Signup</Link>
			</form>
		</div>
	);
};

export default SignIn;
