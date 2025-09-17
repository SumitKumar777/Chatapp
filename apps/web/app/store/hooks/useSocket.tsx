
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



interface UserSocket{
   socket:WebSocket | null
   currentRoomId:string|null,
   rooms:Rooms[]
   message:UserData[],
   setMessage:(data:UserData)=>void,
   setSocket:(connect:WebSocket)=>void
   setRoom:(room:Rooms)=>void
   setCurrentRoomId:(roomId:string)=>void
}



const useSocket=create<UserSocket>((set)=>({
   socket:null,
   currentRoomId:"",
   rooms:[],
   message:[],
   setMessage:(data:UserData)=>set((state)=>({message:[...state.message,data]})),
   setSocket:(connect:WebSocket)=>set(()=>({socket:connect})),
   setRoom:(room:Rooms)=>set((state)=>({rooms:[...state.rooms,room]})),
   setCurrentRoomId:(roomId:string)=>set(() => ({currentRoomId:roomId}) )
}))

export default useSocket;