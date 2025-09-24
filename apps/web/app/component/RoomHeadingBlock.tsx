


type RoomBlock={
   roomName:string,
   roomId:string
}


const RoomHeadingBlock=({roomName,roomId}:RoomBlock)=>{

   return <div className="px-6 border-l-1">
      <h1 className="text-3xl font-bold"># {roomName[0]?.toUpperCase()}{roomName.slice(1)}</h1>
      <h2 className="text-lg pl-4">{roomId}</h2>
   </div>
}

export default RoomHeadingBlock;