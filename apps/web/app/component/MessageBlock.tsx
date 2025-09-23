



type ChatMessage = {
	userId: string;
	name: string;
	message: string;
	time: string;
};

interface ChatMessageWithDetection extends ChatMessage{
   className:string
}


function MessageBlock({userId,name,message,time,className}:ChatMessageWithDetection) {

   return (
			<div className="py-1 px-10">
				<div>
					<div className="flex space-x-2 ">
						<p
							className={`${className} text-2xl flex justify-center items-center rounded-3xl px-2`}
						>
							{name[0]?.toUpperCase()}
						</p>
						<p
							className={`${className} space-x-2 text-xl p-2 inline-block rounded-2xl`}
						>
							{" "}
							{message}
						</p>
					</div>
					<p> {time}</p>
				</div>
			</div>
		);
}

export default MessageBlock;