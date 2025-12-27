

import useSocket from "../store/hooks/useSocket";
import RoomHeadingBlock from "./RoomHeadingBlock";


const RoomHeading=()=>{
  const currentRoomId = useSocket((state) => state.currentRoomId);
	const currentRoomName=useSocket((state)=>state.currentRoomName);

   return (
			<>

					{currentRoomId || currentRoomName ? (
						<RoomHeadingBlock
							roomId={""}
							roomName={currentRoomName || ""}
						/>
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