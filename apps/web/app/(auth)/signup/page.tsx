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
				<form onSubmit={handleSubmit}>
					<label htmlFor="username">
						UserName
						<br />
						<input type="text" name="username" placeholder="Enter your name" />
					</label>
					<label htmlFor="email">
						email
						<br />
						<input type="email" name="email" placeholder="Enter your email" />
					</label>
					<label htmlFor="password">
						password
						<br />
						<input type="password" name="password" placeholder="Enter your name" />
					</label>
               <button type="submit">Signup</button>
				</form>
			</div>
		);
}

export default SignUp;