"use client"

import { useEffect } from "react";
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



// when we type in the input field the state rerender that many times fix that when the user click send only that time state should rerender;



function ShowMessage() {

	const messageByRoom=allMessage((state)=>state.messageByRoom);
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




   return (
			<div className="relative">
				<div className="overflow-y-scroll">
					<div className="text-white  ">
						{(messageByRoom[currentRoomId ?? ""] ?? []).length > 0
							? (messageByRoom[currentRoomId ?? ""] ?? []).map((item :ChatMessage) => (
									<MessageBlock
										key={item.id}
										userId={item.userId}
										name={item.name}
										message={item.message}
										time={item.time}
										className={ item.userId ===userId?.id! ? " bg-pink-600 ":"bg-black/50 "}

									/>
								))
							: "NO Messages for this room"}
					</div>

				
				</div>
			</div>
		);
}

export default ShowMessage;