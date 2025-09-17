"use client";
import axios from "axios";
import { useRouter } from "next/navigation";


const SignUp=()=>{
   const router=useRouter()

   const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const form=new FormData(e.currentTarget);
      const username=form.get("username");
      const email=form.get("email");
      const password=form.get("password");

     try {

       const signUpResponse = await axios.post(
					"http://localhost:3001/signup",
					{ username, email, password },
               {withCredentials:true}
				);

				console.log(signUpResponse, "signupResponse");
            if(signUpResponse){
               router.push("/signin")
            }
           
     } catch (error) {

      console.log(error,"error in the signup");
     }
   }


   return (
			<div>
				<form onSubmit={handleSubmit} className="max-w-[300px] border-2 ">
					<label htmlFor="username" >
						UserName
						<br />
						<input
							type="text"
							name="username"
							placeholder="Enter your name"
							className="border-1 "
						/>
					</label>
					<br />
					<label htmlFor="email">
						email
						<br />
						<input
							type="email"
							name="email"
							placeholder="Enter your email"
							className="border-1"
						/>
					</label>
					<br />
					<label htmlFor="password">
						password
						<br />
						<input
							type="password"
							name="password"
							placeholder="Enter your password"
							className="border-1"
						/>
					</label>
					<br />
					<button type="submit" className="border-1">Signup</button>
				</form>
			</div>
		);
}

export default SignUp;