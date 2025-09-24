import Time from "./Time";

type ChatMessage = {

	name: string;
	message: string;
	time: string;
};



function ReceivedMessage({

	name,
	message,
	time,
}: ChatMessage) {
	return (
		<div className="py-1">
			<div>
				<div className="flex space-x-2   ">
					<p className="text-2xl flex justify-center items-center rounded-3xl px-3.5 bg-black/30 h-10 w-10 mt-1 ">
						{name[0]?.toUpperCase()}
					</p>
					<div className="space-y-2">
						<p className="">
							{name[0]?.toUpperCase()}
							{name.slice(1)}
						</p>
						<p className={` space-x-2 text-xl p-2 inline-block rounded-2xl font-semibold bg-black/40`}>
							{" "}
							{message}
						</p>
						<Time time={time} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default ReceivedMessage;
