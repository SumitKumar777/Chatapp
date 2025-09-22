import { create } from "zustand";



// id for key to render
type ChatMessage={
   userId:string,
   id:string,
   name:string,
   message:string,
   time:string
}




type ChatMessageStore={

   messageByRoom:Record<string,ChatMessage[]>;


   setMessage:(roomId:string,chatMessages:ChatMessage[])=>void;
   addMessage:(roomId:string,chatMessages:ChatMessage)=>void;
   clearMessage:(roomId:string)=>void;
   deleteRoom:(roomId:string)=>void;
}



const allMessage=create<ChatMessageStore>((set)=>({

   messageByRoom:{},

   setMessage:(roomId:string,chatMessage:ChatMessage[])=>set((state)=>({messageByRoom:{...state.messageByRoom,[roomId]:chatMessage}})),

   addMessage:(roomId:string,chatmessage:ChatMessage)=>set((state)=>({messageByRoom:{...state.messageByRoom,[roomId]:[...state.messageByRoom[roomId]|| [],chatmessage]
}})),

   clearMessage:(roomId:string)=>set((state)=>({messageByRoom:{...state.messageByRoom,[roomId]:[]}})),
   deleteRoom:(roomId:string)=>set((state)=>{
			const { [roomId]: deleted, ...rest } = state.messageByRoom;
			return { messageByRoom: rest };
		}),

}))



export default allMessage;


