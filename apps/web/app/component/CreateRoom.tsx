"use client";

import axios from "axios";
import useSocket from "../store/hooks/useSocket";

function CreateRoom() {
   const socket =useSocket((state=>state.socket));
   const setRoom=useSocket((state)=>state.setRoom);
   const setCurrentRoomId=useSocket((state)=>state.setCurrentRoomId);
   const createRoom=async(e:React.FormEvent<HTMLFormElement>)=>{
      const formObj=e.currentTarget;
     try {
       e.preventDefault();
				const form = new FormData(e.currentTarget);

				const roomName = form.get("roomName");
				console.log(roomName, "roomName in the create rooomFrom");

				console.log(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, "backend");
            const createRoomResponse=await axios.post("http://localhost:3001/createroom",{
               roomName
            },
            {
               withCredentials:true
            }
         )

         if(!createRoomResponse || !createRoomResponse.data){
            throw new Error("room not created in create room");
         }
         console.log("createroomResponse",createRoomResponse);
         const roomData={
            roomName:createRoomResponse.data.data.name,
            roomId:createRoomResponse.data.data.id
         }
         if(socket && socket.readyState===WebSocket.OPEN){
              socket?.send(
								JSON.stringify({
									type: "join_room",
									roomId: createRoomResponse.data.data.id,
								})
							);
                     setCurrentRoomId(createRoomResponse.data.data.id);
                     setRoom(roomData);
         }else{
            throw new Error("error in create Room in sending create request to websocket server");
         }

      formObj.reset();
         
     } catch (error:unknown) {

      if(error instanceof Error){
          console.log(
						error,
						"error in form of creating the room",
						error.message
					);
      }else{
          console.log(
						error,
						"unexpected error in form of creating the room",
						error
					);
      }
   formObj.reset();
     }
     
   }
   return ( 
      <>
      <div className="bg-amber-100 rounded-md">
         <form onSubmit={createRoom}>
            <label htmlFor="roomName">
               Enter room Name
               <br />
               <input type="text" name="roomName" className="border-2" required  />
            </label>
            <br />
            <button type="submit">Create Room</button>

         </form>
      </div>
      </>
    );
}

export default CreateRoom;