"use client";

import axios from "axios";
import useSocket, { Rooms } from "../store/hooks/useSocket";


function RoomBlock({roomName,roomId}:Rooms) {
	const setCurrentRoomId=useSocket((state)=>state.setCurrentRoomId);
	const socket=useSocket((state)=>state.socket);
	const room=useSocket((state)=>state.rooms);
	const deleteRoom=useSocket((state)=>state.deleteRoom);
	const deleteMessage=useSocket((state)=>state.deleteMessage);
	const currentRoomId=useSocket((state)=>state.currentRoomId);

	// when the user click on delete room first it should make call to the backend and then to webSocket backend and then remove from the dom 

	const leaveRoom=async():Promise<"deleted"|"not_Deleted">=>{
		return new Promise((resolve,reject)=>{
		try {
			console.log("beginning");
				const foundUser = room.some((item) => item.roomId === roomId);

				// true when roomId is found so user not left the room 
				// false when roomId is not found so user left the room so return deleted

				if (!foundUser) {
					return resolve("deleted");
				}
				console.log("first");

				const socketData = {
					type: "leave_room",
					roomId,
				};


				if (socket?.readyState === WebSocket.OPEN) {
					socket.send(JSON.stringify(socketData));

					return resolve("deleted");
				} else {
					console.log("last done")
					return resolve("not_Deleted");
				}

		} catch (error) {
			console.log(error,"error in leave room ");
			return reject(error)
		}
		})
	}


	// ! what if the user first leave room  then user press delete room 

	const handleDelete=async()=>{
		// it should send request to should send request to websocket backend to cut the connection and then make the request to the backend to remove the user from the database
		try {

			const connection=await leaveRoom();

			if(connection==="not_Deleted"){
				throw new Error("not removed from the websocket backend");
			}
			const backendRemove = await axios.delete(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/leaveroom`,
				{data:{roomId},
					withCredentials:true
				},				
			);

			if(backendRemove){
				console.log(backendRemove,"backend removed the user from the room");
			}else{
				throw new Error("backend refused");
			}

			// remove from the room state 
			deleteRoom(roomId);
			deleteMessage(roomId);


		} catch (error:unknown) {
			if(error instanceof Error){
				console.log("error in roomDeletion",error)
			}
		}
	}
	
  
   return (
			<div
				className={`flex mb-1 justify-end ${currentRoomId===roomId ? "bg-purple-600":"bg-purple-800"} text-white`}
				onClick={() => setCurrentRoomId(roomId)}
			>
				<div>
					<h1>{roomName}</h1>
					<p>{roomId}</p>
				</div>
				<div>
					<button onClick={() => leaveRoom()} className="bg-blue-500">
						Leave
					</button>
					<button onClick={() => handleDelete()} className="bg-blue-400">
						Delete Room
					</button>
				</div>
			</div>
		);
}

export default RoomBlock;