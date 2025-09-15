"use client";

import axios from "axios";

function CreateRoom() {

   const createRoom=async(e:React.FormEvent<HTMLFormElement>)=>{
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
         console.log("createroomResponse",createRoomResponse);


     } catch (error:any) {
      console.log(error,"error in form of creating the room",error.message);
      
     }
   }
   return ( 
      <>
      <div className="bg-red-400">
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