import { useEffect, useRef } from "react";
import { VideoCall } from "../../services/videoCall";




function VideoCallPage() {

   const localVideoRef= useRef<HTMLVideoElement|null>(null);
   const remoteVideoRef= useRef<HTMLVideoElement|null>(null);

   useEffect(()=>{
      const videoInstance = VideoCall.getInstance();

         if (localVideoRef.current && videoInstance.localStreams) {
						localVideoRef.current.srcObject =videoInstance.localStreams
					}
         if(remoteVideoRef.current){
            remoteVideoRef.current.srcObject=videoInstance.remoteStream
         }

   
   },[])


  return (
		<div>
			<h1>Video Call Page</h1>

			<video ref={localVideoRef}></video>
			<video ref={remoteVideoRef}></video>
		</div>
	);
}

export default VideoCallPage;