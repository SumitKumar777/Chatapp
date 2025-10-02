import BackButton from "./BackButton";




type RoomBlock={
   roomName:string,
   roomId:string
}


const RoomHeadingBlock=({roomName,roomId}:RoomBlock)=>{

   return (
			<div className=" md:px-6 border-l-1 flex items-center ">
            <BackButton/>
				<div className="ml-4">
					<h1 className="text-3xl font-bold">
						# {roomName[0]?.toUpperCase()}
						{roomName.slice(1)}
					</h1>
					<h2 className="text-lg pl-4">{roomId}</h2>
				</div>
			</div>
		);
}

export default RoomHeadingBlock;