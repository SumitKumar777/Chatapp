"use client";

import axios from "axios";
import useSocket, { Rooms } from "../store/hooks/useSocket";


function RoomBlock({roomName,roomId}:Rooms) {
	const setCurrentRoomId=useSocket((state)=>state.setCurrentRoomId);
	const socket=useSocket((state)=>state.socket);
	const room=useSocket((state)=>state.rooms);
	const setRoom=useSocket((state)=>state.setRoom);

	// when the user click on delete room first it should make call to the backend and then to webSocket backend and then remove from the dom 

	const leaveRoom=async():Promise<"deleted"|"not_Deleted">=>{


		const foundUser=room.some((item)=>item.roomId===roomId);
		if(foundUser){
			return "deleted";
		}

		const socketData={
				type:"leave_room",
				roomId
			}
			if(socket?.readyState===WebSocket.OPEN){
				socket.send(JSON.stringify(socketData));
				return "deleted"
			}else{
				return "not_Deleted"
			}
			
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
				{data:roomId as string,
					withCredentials:true
				},				
			);

			if(backendRemove){
				console.log(backendRemove,"backend removed the user from the room");
			}else{
				throw new Error("backend refused");
			}

			// remove from the room state 

			const updatedRooms=room.filter((item)=>item.roomId!==roomId);
			console.log(updatedRooms,"updatedRooms");

		} catch (error:unknown) {
			if(error instanceof Error){
				console.log("error in roomDeletion")
			}
		}
	}
	
  
   return (
			<div className="flex bg-green-400 border-1 justify-end " onClick={() => setCurrentRoomId(roomId)}>
				<div>
					<h1>{roomName}</h1>
					<p>{roomId}</p>
				</div>
				<div>
					<button onClick={leaveRoom} className="bg-blue-500">Leave</button>
					<button onClick={handleDelete} className="bg-blue-400">Delete Room</button>
				</div>
			</div>
		);
}

export default RoomBlock;