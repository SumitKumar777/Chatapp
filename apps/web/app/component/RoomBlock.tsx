"use client";

import useSocket, { Rooms } from "../store/hooks/useSocket";


function RoomBlock({roomName,roomId}:Rooms) {
	const setCurrentRoomId=useSocket((state)=>state.setCurrentRoomId);

	// when the user click on delete room first it should make call to the backend and then to webSocket backend and then remove from the dom 
	
  
   return (
			<div className="flex " onClick={()=>setCurrentRoomId(roomId)}>
				<div>
					<h1>{roomName}</h1>
               <p>{roomId}</p>
				</div>
				<button >Delete Room</button>
			</div>
		);
}

export default RoomBlock;