import { useEffect, useRef } from "react";
import useSocket from "../../store/hooks/useSocket";




function VideoCallPage() {
   const socket =  useSocket((state) => state.socket);
   const localVideoRef= useRef<HTMLVideoElement|null>(null);

   const getUserMediaAccess=async ()=>{
      const streams=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      
   }

   useEffect(()=>{
      if(socket?.readyState===WebSocket.OPEN){

         socket.onmessage=()=>{
            
         }
      }else{
         console.log("userConnection is not open");
      }
   })



  return (
    <div>
      <h1>Video Call Page</h1>

    </div>
  );
}

export default VideoCallPage;