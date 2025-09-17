"use client";

import axios from "axios";
import useSocket from "../store/hooks/useSocket";

function JoinRoom() {
	const setRoom=useSocket((state)=>state.setRoom)
	const socket=useSocket((state)=>state.socket);
	const setCurrentRoomId=useSocket((state)=>state.setCurrentRoomId);
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
							setCurrentRoomId(roomId as string)
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
			<div className="bg-amber-200 ">
				<form onSubmit={joinRoom} className="">
					<label htmlFor="roomId">
						Enter room Id
						<br />
						<input type="text" name="roomId" className="border-2" required />
					</label>
					<br />
					<button type="submit">Join Room</button>
				</form>
			</div>
		</>
	);
}

export default JoinRoom;
