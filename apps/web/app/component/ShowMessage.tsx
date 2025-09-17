"use client"

import { useState } from "react";
import useSocket from "../store/hooks/useSocket";
import MessageBlock from "./MessageBlock";
import axios from "axios";




function ShowMessage() {
   const message=useSocket((state)=>state.message);
   const [userMessage,setUserMessage]=useState("");
   const socket=useSocket((state)=>state.socket);
   const currentRoomId=useSocket((state)=>state.currentRoomId);

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
			<>
				<div className="">
					<div>
						{message.length !== 0
							? message
									.filter((item) => item.roomId === currentRoomId)
									.map((item) => (
										<MessageBlock
											key={item.roomId}
											roomId={item.roomId}
											from={item.from}
											message={item.message}
										/>
									))
							: "Create or Connect to room to see messages"}
					</div>
					<div className="absolute bottom-0  ">
						<div className=" space-x-2  ">
							<input
								type="text"
								placeholder="Enter message"
								className=" border-2  "
								value={userMessage}
								onChange={(e) => setUserMessage(e.target.value)}
							/>
							<button onClick={() => handleSendMessage()} className="border-2">
								Send
							</button>
						</div>
					</div>
				</div>
			</>
		);
}

export default ShowMessage;