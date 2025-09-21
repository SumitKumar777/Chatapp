"use client";
import useSocket from "../store/hooks/useSocket";
import RoomBlock from "./RoomBlock";

function ListRooms({classes}:{classes:string}) {
   const room=useSocket((state)=>state.rooms);
   console.log(room,"listroom");

   return ( 
      <>
      <div className={classes}>

         {room.length!==0 ? room.map((item)=><RoomBlock key={item.roomId} roomName={item.roomName} roomId={item.roomId} />):"No Room Present connect to room or join room to start chatting "}
      </div>
      </>
    );
}

export default ListRooms;