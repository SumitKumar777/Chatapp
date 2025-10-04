
import useSocket from "../store/hooks/useSocket";
import axios from "axios";
import { Send } from "lucide-react";





function SendMessage( {className}:{className:string}) {


   const socket = useSocket((state) => state.socket);
   const currentRoomId = useSocket((state) => state.currentRoomId);

    const handleSendMessage = async (e:React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formObj=e.currentTarget;
      const formData= new FormData(formObj);

      const userMessage = formData.get("chatMessage");
		
			if (!userMessage || userMessage===" ") {
				console.log(userMessage);
				console.log("message is empty");
				return;
			}
			try {
				// Send request to the backend and then to websocket server which will then broadcast the message to all the connected user ;
            if(!currentRoomId){
               console.log("roomId is not present so send Message failed");
               throw new Error("roomId is not present sendMessage");
            }
				const data = {
					roomId: currentRoomId,
					message: userMessage,
				};

				const sendMessage = await axios.post(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/message`,
					data,
					{ withCredentials: true }
				);
				if (!sendMessage) {
					console.log(
						sendMessage,
						"sendMessageresponse from backend in handleSendMessage"
					);
               throw new Error(
									"sendMessageresponse from backend in handleSendMessage"
								);
				}

				if (socket && socket.readyState === WebSocket.OPEN) {
					socket?.send(
						JSON.stringify({
							type: "message",
							roomId: currentRoomId,
							message: userMessage,
						})
					);
				} else {
					console.log(
						"socket is present or socket is not open in sending message "
					);
				}
            formObj.reset();
			} catch (error: unknown) {
				if (error instanceof Error) {
					console.log("error in handleSendMessage", error.message);
				} else {
					console.log("unexpected error in the handleSendMessage", error);
				}
            formObj.reset();
			}
		};

      
   return (
			<div className={`border-1 p-4 flex-1 ${className}`}>
				<form
					className=" space-x-10 flex text-white  "
					onSubmit={handleSendMessage}
				>
					<textarea
						placeholder="Enter message"
						name="chatMessage"
						className="w-full p-2 rounded-xl bg-black/50 text-white resize-none outline-none"
						rows={1}
					/>
					<button
						aria-label="Send message"
						className=" p-2 rounded-xl bg-green-600 border-none flex justify-end items-center"
						type="submit"
					>
						<Send />
					</button>
				</form>
			</div>
		);
}

export default SendMessage;