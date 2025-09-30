
import GetStarted from "./GetStartedButton";

function MainContent() {
	return (
		<div className="flex items-center justify-center h-[80%]">
			<div className="max-w-[800px] text-center space-y-2">
				<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
					Connect Instantly with
				</h1>
				<h2 className="text-5xl md:text-5xl lg:text-7xl font-bold text-purple-700">
					Friends and Teams
				</h2>
				<p className="text-lg  max-w-[400px] md:text-lg md:max-w-[500px]  lg:text-2xl text-gray-300 lg:max-w-[600px] mx-auto mb-6 mt-4">
					Experience seamless real-time communication. Create rooms, collaborate
					effortlessly, and stay connected with your team—all in one place.
				</p>
				<GetStarted/>
			</div>
		</div>
	);
}

export default MainContent;
