import LandingPage from "./component/LandingPage";
import LandingPageNavbar from "./component/LandingPageNavbar";



export default function Home() {
  return (
    <div className="h-screen bg-black/60 flex flex-col">
      <LandingPageNavbar />
      <LandingPage />
    </div>
  );
}
