"use client";
import { useEffect, useRef } from "react";
import { VideoCall } from "../../services/videoCall";




function VideoCallPage() {

   const localVideoRef= useRef<HTMLVideoElement|null>(null);
   const remoteVideoRef= useRef<HTMLVideoElement|null>(null);

   useEffect(()=>{
      const startStreams= async ()=>{
          const videoInstance = VideoCall.getInstance();

					if (localVideoRef.current && videoInstance.localStreams) {
						localVideoRef.current.srcObject = videoInstance.localStreams;
					} else {
						console.log("local stream not found");
					}
					
              setTimeout(async ()=>{
                  if (remoteVideoRef.current && videoInstance.remoteStream) {
										remoteVideoRef.current.srcObject =
											videoInstance.remoteStream;
                                 await remoteVideoRef.current.play();
									} else {
										console.log("remote stream not found in videocall");
									}
               },3000)
      }


         startStreams()


   },[])


  return (
		<div>
			<h1>Video Call Page</h1>

			<video ref={localVideoRef} autoPlay playsInline muted></video>
			<video ref={remoteVideoRef}   playsInline ></video>
		</div>
	);
}

export default VideoCallPage;