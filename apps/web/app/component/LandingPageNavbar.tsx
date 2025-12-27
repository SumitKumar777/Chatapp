import Link from "next/link";

function LandingPageNavbar() {
  return (
    <div className="flex justify-between p-4 border-b-1 border-black md:px-10 md:py-4">
      <h1 className="text-3xl font-bold">PaaPay Chat</h1>
      <div className="flex space-x-2">
        <Link
          href={"/signup"}
          className="px-4 py-2  font-medium bg-black/35 hover:bg-black/25 rounded-lg text-gray-300"
        >
          SignUp
        </Link>
        <Link
          href={"/signin"}
          className="px-4 py-2 font-medium bg-black/35 hover:bg-black/25 rounded-lg text-gray-300"
        >
          SignIn
        </Link>
      </div>
    </div>
  );
}

export default LandingPageNavbar;
