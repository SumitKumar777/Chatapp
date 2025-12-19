import * as mediasoup from 'mediasoup';
import { Consumer, MediaKind, Producer, Router, WebRtcTransport, Worker } from 'mediasoup/types';


type WorkerAppData={
   workerIndex:number;
   purpose:"media"| "recording";

}

type RouterAppData={
   roomId:string;
}






class VideoCall{

   static worker:Worker;
   private static workerIndex:number=0;
   static routersMap: Map<string,Router>= new Map();

   

   static async getWorker(){
      try {
         if (!this.worker) {
            this.worker = await mediasoup.createWorker<WorkerAppData>(
               {
                  logLevel: "debug",
                  logTags: [
                     "info",
                     "ice",
                     "dtls",
                     "rtp",
                     "srtp",
                     "rtcp"
                  ],
                  rtcMinPort: 40000,
                  rtcMaxPort: 40500,
                  appData: {
                     workerIndex: this.workerIndex,
                     purpose: "media"
                  }
               }
            )
            this.workerIndex += 1;
         }
         return this.worker;
      } catch (error:unknown) {
         console.log("error while Worker creation",error)
      }
   }
}


const mediaCodecs=[
   {
    kind        : "audio" as MediaKind,
    mimeType    : "audio/opus",
    clockRate   : 48000,
    channels    : 2
  },
  {
    kind       : "video" as MediaKind,
    mimeType   : "video/H264",
    clockRate  : 90000,
    parameters :
    {
      "packetization-mode"      : 1,
      "profile-level-id"        : "42e01f",
      "level-asymmetry-allowed" : 1
    }
  },
  
]



export const getRouter= async (roomId:string)=>{

   if(VideoCall.routersMap.has(roomId)){
      return VideoCall.routersMap.get(roomId);
   }
   const workerInstance=await VideoCall.getWorker();
   if(!workerInstance){
      console.log("worker creation failed in router creation",workerInstance);
      return;
   }

   const routerInstance= await workerInstance.createRouter<RouterAppData>(
      {
         mediaCodecs,
         appData:{roomId:roomId}
      }
   )

   VideoCall.routersMap.set(roomId,routerInstance);

   return routerInstance;

}


export const  routerTransport= async (routerInstance:Router)=>{
  

   const transportInstance=await routerInstance?.createWebRtcTransport(
      {
         listenInfos:[
            {
               protocol:"udp",
               ip:"0.0.0.0",
               announcedIp:"127.0.0.1"
            }
         ],
         enableUdp:true,
         enableTcp:true,
         preferUdp:true

      }
   )

   return transportInstance;
}


