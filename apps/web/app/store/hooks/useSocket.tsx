
import { create } from "zustand";

export interface Rooms{
   roomName:string;
   roomId:string;
}

export interface UserData{
   roomId:string,
   from:string,
   message:string
}



interface CurrentMessage{
	userId:string,
	id:string,
	name:string,
	message:string,
	time:string
}



interface UserSocket {
	socket: WebSocket | null;
	currentRoomId: string | null;
	currentRoomName:string|null;
	rooms: Rooms[];
	message: UserData[];
	currentMessage:CurrentMessage[];
	setSocket: (connect: WebSocket|null) => void;
	setMessage: (data: UserData) => void;
   deleteMessage:(roomId:string)=>void;
	setCurrentMessage:(messages:CurrentMessage[])=>void;
   addMessage:(allMessage:UserData[])=>void,
	setRoom: (room: Rooms) => void;
   addRoom:(allRooms:Rooms[])=>void;
	deleteRoom: (roomId: string) => void;
	setCurrentRoomId: (roomId: string) => void;
	setCurrentRoomName:(roomName:string)=>void;
}



const useSocket = create<UserSocket>((set) => ({
	socket: null,
	currentRoomId: "",
	currentRoomName:"",
	rooms: [],
	message: [],
	currentMessage:[],
	setSocket: (connect: WebSocket|null) => set(() => ({ socket: connect })), 
	setMessage: (data: UserData) =>
		set((state) => ({ message: [...state.message, data] })),

   deleteMessage:(roomId:string)=>set((state)=>({message:state.message.filter((item)=>item.roomId !==roomId)})),
	setCurrentMessage:(messages:CurrentMessage[])=>set(()=>({currentMessage:messages})),
   addMessage:(allMessage:UserData[])=>set(()=>({message:allMessage})),
	setRoom: (room: Rooms) => set((state) => ({ rooms: [...state.rooms, room] })),
	deleteRoom: (roomId: string) =>
		set((state) => ({
			rooms: state.rooms.filter((item) => item.roomId !== roomId),
		})),
   addRoom:(allRooms:Rooms[])=>set(()=>({rooms:allRooms})),
	setCurrentRoomId: (roomId: string) => set(() => ({ currentRoomId: roomId })),
	setCurrentRoomName:(roomName:string)=>set(()=>({currentRoomName:roomName}))
}));

export default useSocket;