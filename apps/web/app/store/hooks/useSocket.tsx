
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


interface UserSocket {
	socket: WebSocket | null;
	currentRoomId: string | null;
	rooms: Rooms[];
	message: UserData[];
	setSocket: (connect: WebSocket) => void;
	setMessage: (data: UserData) => void;
   deleteMessage:(roomId:string)=>void;
   addMessage:(allMessage:UserData[])=>void,
	setRoom: (room: Rooms) => void;
   addRoom:(allRooms:Rooms[])=>void;
	deleteRoom: (roomId: string) => void;
	setCurrentRoomId: (roomId: string) => void;
}



const useSocket = create<UserSocket>((set) => ({
	socket: null,
	currentRoomId: "",
	rooms: [],
	message: [],
	setSocket: (connect: WebSocket) => set(() => ({ socket: connect })), 
	setMessage: (data: UserData) =>
		set((state) => ({ message: [...state.message, data] })),

   deleteMessage:(roomId:string)=>set((state)=>({message:state.message.filter((item)=>item.roomId !==roomId)})),
   addMessage:(allMessage:UserData[])=>set(()=>({message:allMessage})),
	setRoom: (room: Rooms) => set((state) => ({ rooms: [...state.rooms, room] })),
	deleteRoom: (roomId: string) =>
		set((state) => ({
			rooms: state.rooms.filter((item) => item.roomId !== roomId),
		})),
   addRoom:(allRooms:Rooms[])=>set(()=>({rooms:allRooms})),
	setCurrentRoomId: (roomId: string) => set(() => ({ currentRoomId: roomId })),
}));

export default useSocket;