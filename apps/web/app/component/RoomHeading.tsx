"use client";

import useSocket from "../store/hooks/useSocket";
import RoomHeadingBlock from "./RoomHeadingBlock";

const RoomHeading=()=>{
   const currentRoomId=useSocket((state)=>state.currentRoomId);
   const room=useSocket((state)=>state.rooms);
   return (
			<>
				{room.forEach((item) =>
					item.roomId === currentRoomId ? (
						<RoomHeadingBlock roomId={item.roomId} roomName={item.roomName} />
					) : null
				) ?? (
					<RoomHeadingBlock
						roomName={"No Rooms"}
						roomId={"create Rooms to get chat with friends"}
					/>
				)}
			</>
		);


}

export default RoomHeading;