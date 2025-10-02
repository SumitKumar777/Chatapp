

import { RoomDetails } from "../store/hooks/useRoom";

interface SearchRoomBlockProps extends RoomDetails{
   onClick:(name:string)=>void
}

function SearchRoomBlock({id,name,createdAt,onClick}:SearchRoomBlockProps) {
   return (
			<div onClick={()=>onClick(id) } className="p-2 border-1" >
				<p className="text-xl font-semibold">{name}</p>
				<p>Created At {new Date(createdAt).toLocaleDateString()}</p>
			</div>
		);
}

export default SearchRoomBlock;