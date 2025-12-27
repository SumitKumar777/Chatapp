
import useSocket from "../store/hooks/useSocket";
import RoomBlock from "./RoomBlock";

function ListRooms({classes}:{classes:string}) {

   const room=useSocket((state)=>state.rooms);

   return (
			<>
				<div className={`${classes} h-full scroll-smooth py-4 px-2 `}>
					{room.length !== 0 ? (
						room.map((item) => (
							<RoomBlock
								key={item.roomId}
								roomName={item.roomName}
								roomId={item.roomId}
							/>
						))
					) : (
						<p className=" text-center text-xl">
							No Room Present create  room or join room to start chatting 
						</p>
					)}
				</div>
			</>
		);
}

export default ListRooms;