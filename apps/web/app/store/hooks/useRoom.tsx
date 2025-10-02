import { create } from "zustand";



export interface RoomDetails{
   id:string,
   name:string,
   createdAt:string
}


interface RoomType{
   roomDetail:RoomDetails[],
   joinRoomState:boolean,
   setRoomDetail:(roomDetailData:RoomDetails[])=>void
   setJoinRoomState:(value:boolean)=>void
}


const useRoom = create<RoomType>((set) => ({
	roomDetail: [],
   joinRoomState:false,
	setRoomDetail: (roomDetailData: RoomDetails[]) =>
		set(() => ({ roomDetail: roomDetailData })),
   setJoinRoomState:(value)=>set(()=>({joinRoomState:value}))
}));

export default useRoom;

