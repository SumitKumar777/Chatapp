import Time from "./Time";

type ChatMessage = {
	name: string;
	message: string;
	time: string;
};



function SentMessage({
	name,
	message,
	time,

}: ChatMessage) {
	return (
		<div className=" flex justify-end pt-3  ">
			<div className="space-y-1 ">
				<div className="flex space-x-2 justify-end ">
					<p className="text-2xl flex justify-center items-center rounded-3xl px-3.5 bg-pink-700 h-10 ">
						{name[0]?.toUpperCase()}
					</p>
					<p className="space-x-2 text-xl max-w-[400px] p-2 inline-block rounded-2xl bg-pink-600 md:max-w-[600px] break-words">
						{message}
					</p>
				</div>
				<div className="flex justify-end">
					<Time time={time} />
				</div>
			</div>
		</div>
	);
}

export default SentMessage;
