"use client";

import axios from "axios";
import useSocket from "../store/hooks/useSocket";

function JoinRoom() {
	const setRoom=useSocket((state)=>state.setRoom)
	const socket=useSocket((state)=>state.socket);
	const setCurrentRoomId=useSocket((state)=>state.setCurrentRoomId);
	const setCurrentRoomName=useSocket((state)=>state.setCurrentRoomName);
	const joinRoom = async (e: React.FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault();
			const form = new FormData(e.currentTarget);

			const roomId = form.get("roomId");
			console.log(roomId, "roomId in the create rooomFrom");

			console.log(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, "backend");
			const joinRoomResponse = await axios.post(
				"http://localhost:3001/joinroom",
				{
					roomId,
				},
				{
					withCredentials: true,
				}
			);
			console.log("joinRoomResponse",joinRoomResponse );
			 const roomData={
            roomName:joinRoomResponse.data.data.name || " ",
            roomId:roomId as string
         }
         if(socket && socket.readyState===WebSocket.OPEN){
              socket?.send(
								JSON.stringify({
									type: "join_room",
									roomId: roomId,
								})
							);
							setCurrentRoomId(roomId as string);
							setCurrentRoomName(joinRoomResponse.data.data.room.name);
							
                     setRoom(roomData);
			}else{
				 console.log("Socket not ready yet, cannot join room");
			}
			console.log("room joined by user")
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.log(error, "error in form of joining the room", error.message);
			} else {
				console.log(
					error,
					"unexpected error in form of joining the room",
				);
			}
		}
	};
	return (
		<>
			<div className="bg-blue-500/50 rounded-lg p-2">
				<form onSubmit={joinRoom} className="space-x-4">
					<label htmlFor="roomId " className="text-2xl ">
						Join Room
						<br />
						<input
							type="text"
							name="roomId"
							className="border-2 p-1"
							required
							placeholder="Enter Room name"
						/>
					</label>
					<button
						type="submit"
						className="bg-black/30 rounded-md p-2 text-md text-amber-50"
					>
						Join
					</button>
				</form>
			</div>
		</>
	);
}

export default JoinRoom;
