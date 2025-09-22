"use client"

import { useEffect, useState } from "react";
import useSocket from "../store/hooks/useSocket";
import MessageBlock from "./MessageBlock";
import axios from "axios";
import allMessage from "../store/hooks/allMessage";
import userDetail from "../store/hooks/userDetails";


type ChatMessage = {
	userId: string;
	id: string;
	name: string;
	message: string;
	time: string;
};



// when we type in the input field the state rerendet that many times fix that when the user click send only that time state should rerender;



function ShowMessage() {

	const messageByRoom=allMessage((state)=>state.messageByRoom);
   const [userMessage,setUserMessage]=useState("");
   const socket=useSocket((state)=>state.socket);
   const currentRoomId=useSocket((state)=>state.currentRoomId);
	const userId=userDetail((state)=>state.userId);

	const setMessage=allMessage((state)=>state.setMessage);




	useEffect(()=>{

		const fetchMessage=async(roomId:string)=>{

			const messages = await axios.get(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/getRoomChats/${roomId}`,
				{
					withCredentials:true
				}
			);
			console.log("messages in the setting the messages",messages.data.data)
			setMessage(currentRoomId!,messages.data.data)
		}




		if(currentRoomId){
			fetchMessage(currentRoomId);
		}

	},[currentRoomId])


   const handleSendMessage=async()=>{

      if(!userMessage){
         console.log(userMessage);
         console.log("message is empty");
         return ;
      }
      try {
         // Send request to the backend and then to websocket server which will then broadcast the message to all the connected user ;
       
         const data={
            roomId:currentRoomId,
            message:userMessage
         }
         const sendMessage = await axios.post(
						`${process.env.NEXT_PUBLIC_BACKEND_URL}/message`,data,
                  {withCredentials:true}
					);
            if(!sendMessage){
               console.log(sendMessage,"sendMessageresponse from backend in handleSendMessage");
            }

       if(socket && socket.readyState===WebSocket.OPEN){
           socket?.send(
							JSON.stringify({
								type: "message",
								roomId: currentRoomId,
								message: userMessage,
							})
						);
       }else{
         console.log("socket is present or socket is not open in sending message ")
       }

      } catch (error:unknown) {
         if(error instanceof Error){
            console.log("error in handleSendMessage",error.message)
         }else{
            console.log("unexpected error in the handleSendMessage",error)
         }
      }
   }



   return (
			<div className="relative">
				<div className="overflow-y-scroll">
					<div className="bg-yellow-200 ">
						{(messageByRoom[currentRoomId ?? ""] ?? []).length > 0
							? (messageByRoom[currentRoomId ?? ""] ?? []).map((item :ChatMessage) => (
									<MessageBlock
										key={item.id}
										userId={item.userId}
										name={item.name}
										message={item.message}
										time={item.time}
										className={ item.userId ===userId?.id! ? " bg-green-400":"bg-red-500"}

									/>
								))
							: "NO Messages for this room"}
					</div>

					<div className="absolute bottom-0  bg-amber-700  ">
						<div className=" space-x-2  ">
							<input
								type="text"
								placeholder="Enter message"
								className=" border-2   "
								value={userMessage}
								onChange={(e) => setUserMessage(e.target.value)}
							/>
							<button onClick={() => handleSendMessage()} className="border-2">
								Send
							</button>
						</div>
					</div>
				</div>
			</div>
		);
}

export default ShowMessage;