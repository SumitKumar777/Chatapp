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
				process.env.NODE_ENV === "development"
					? `${process.env.NEXT_PUBLIC_BACKEND_URL}/signin`
					: "/api/signin",
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
  <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-black/70 transition-colors duration-300">
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-700 p-8 rounded-lg shadow-md space-y-6 transition-colors duration-300"
    >
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">
        Sign In
      </h1>


      <div className="flex flex-col">
        <label htmlFor="email" className="text-gray-700 dark:text-gray-200 mb-2">
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
        <label htmlFor="password" className="text-gray-700 dark:text-gray-200 mb-2">
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
        className="w-full py-2 px-4 rounded-md bg-blue-600 dark:bg-blue-500 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
      >
        Sign In
      </button>


      <p className="text-center text-gray-700 dark:text-gray-300">
        Don’t have an account?{" "}
        <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  </div>
);
};

export default SignIn;
