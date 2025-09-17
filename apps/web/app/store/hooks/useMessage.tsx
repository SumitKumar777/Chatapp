import { create } from "zustand";


export interface UserData{
   roomId:string,
   from:string,
   message:string
}

interface UserMessage {
   message:UserData|null
   setMessage:(data:UserData)=>void
}


const useMessage=create<UserMessage>((set)=>({
   message:null,
   setMessage:(data:UserData)=>set(()=>({message:data}))
}))

export default useMessage;