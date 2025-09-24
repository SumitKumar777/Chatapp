"use client";

import useSocket from "../store/hooks/useSocket";
import RoomHeadingBlock from "./RoomHeadingBlock";

const RoomHeading=()=>{
   const currentRoomId=useSocket((state)=>state.currentRoomId);
	const currentRoomName=useSocket((state)=>state.currentRoomName);
	console.log("roomname in the room Heading ",currentRoomName);
	console.log("currentId in the room Heading ", currentRoomId);

   return (
			<>
				{(currentRoomId && currentRoomName)? (
					<RoomHeadingBlock roomId={currentRoomId} roomName={currentRoomName} />
				) : (
					<RoomHeadingBlock
						roomId={"Create/Join room to chat or see messages"}
						roomName={"NO ROOMS"}
					/>
				)}
			</>
		);


}

export default RoomHeading;