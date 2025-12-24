import { Device } from "mediasoup-client";
import { Transport, TransportOptions } from "mediasoup-client/types";




export class VideoCall {
   static #videoInstance: VideoCall;
    #socket: WebSocket | null = null;
    #device: Device | null = null;
    #sendTransport: Transport | null = null;
    #recvTransport: Transport | null = null;
    #pendingCallbacks: Map<
      string,
      { callback: Function; errback: Function }
   > =  new Map();
    localStreams:MediaStream|null=null;
    currentRoomID:string|null=null;
    remoteStream:MediaStream|null=null;

    #pendingResolve:(()=>void)|null=null;
   #pendingReject: ((err: Error) => void) | null = null;
    #pendingPromise:Promise<void>|null=null;



   static getInstance(){
      if(!this.#videoInstance){
         return this.#videoInstance=new VideoCall();
      }
      return this.#videoInstance;
   }

   async connect(authtoken:string):Promise<void>{
      try {
         if (this.#socket) return;

         if (!authtoken) {
            throw new Error("authToken empty in videoConnect");
         }

         const connection = new WebSocket(`ws://localhost:8080/ws/video?token=${authtoken}`);

         await new Promise<void>((resolve, reject) => {
            connection.onopen = () => {
               this.#socket = connection;
               console.log("connection is made in vidoCall");
               resolve()
            }

            connection.onerror = (err) => {
               console.log("error in connect", err);
               reject(new Error("connection failed "));
            }
         })

         connection.onmessage = async (message) => {
            let parsedData;

            try {
               parsedData = JSON.parse(message.data.toString())
               
            } catch {
               console.log("received non json data king", message.data.toString())
               return;
            }

            console.log("parsed Data outside",parsedData);

            let type;

            if (!parsedData.type) {
               throw new Error("type property is missing");
            }else{
               type=parsedData.type;
            }



            if (type === "transportOptions") {
               try {
                  const {
                     routerRtpCapabilities,
                     sendTransportOptions,
                     recvTransportOptions,
                  } = parsedData;
                  const deviceResult = await this.#createDevice(routerRtpCapabilities);

                  if (!deviceResult.status) {
                     throw new Error("device Creation failed");
                  }

                  this.#createSendTransportFunc(sendTransportOptions);
                  this.#createRecvTransportFunc(recvTransportOptions);
                  await this.#createProducer();
               } catch (error) {
                  console.log(
                     "error on TransportOptions on webSocketConnection",
                     error
                  );
               }
            }

            if (type === "producerCreated") {
               try {
                  if (!this.#pendingCallbacks) {
                     console.log("")
                     throw new Error("pendingCallbacks is empty or request is not present");
                  }
                  const pendingCalls = this.#pendingCallbacks.get(
                     parsedData.requestId
                  );

                  if (!pendingCalls) {
                     throw new Error(
                        "request Id is missing in server response producerCreated"
                     );
                  }

                  if (parsedData.success) {
                     pendingCalls.callback(parsedData.producerId);
                     connection.send(
                        JSON.stringify({
                           type: "createConsumer",
                           roomId: this.currentRoomID,
                           producerId: parsedData.producerId,
                           clientRtpCapabilites: this.#device?.rtpCapabilities,
                        })
                     );
                  } else {
                     pendingCalls.errback(parsedData.error);
                  }

                  this.#pendingCallbacks.delete(parsedData.requestId);
               } catch (error) {
                  console.log("error in producer created", error);
                  this.#pendingReject?.(error as Error)
               }
            }

            if (type === "createdConsumerResponse") {
               try {
                  if (parsedData.success) {
                     const remoteConsumer =
                        await this.#recvTransport?.consume(
                           parsedData.consumerOptions
                        );

                     if (!remoteConsumer) {
                        throw new Error("cosumer not created");
                     }

                     console.log("remoteConsumer", remoteConsumer);


                     const { track } = remoteConsumer;

                     if (!this.remoteStream) {
                        this.remoteStream = new MediaStream();
                     }
                     this.remoteStream.addTrack(track);



                     connection.send(JSON.stringify({ type: "resumeConsumer", consumerId: parsedData.consumerOptions.id, roomId: this.currentRoomID }))
                     this.#pendingResolve?.()
                  } else {
                     console.log("consumer not created");
                  }
               } catch (error) {
                  console.log("error in the createdConsumerResponse", error);
               }
            }


         }
      } catch (error) {
         console.log("error in connect",error);
         return;
         
      }
   }
   
   initVideoCall = (currentRoomId:string):Promise<void> => {
      this.currentRoomID=currentRoomId;

      this.#pendingPromise= new Promise((resolve,reject)=>{

         this.#pendingResolve=resolve;
         this.#pendingReject=reject;
      }
   )
      this.#socket?.send(
         JSON.stringify({ type: "startVideoCall", roomId: currentRoomId })
      );
      // setLoading = true and make it false when the user gets message on the socket
      console.log("initVideoFuncCalled");

      return this.#pendingPromise;
   };


   #createDevice = async (
      routerRtpCapabilities: any
   ): Promise<{ status: true | false }> => {
      console.log("routerCapabitlites in device creation",routerRtpCapabilities);
      try {
         this.#device= new Device();

         await this.#device.load({routerRtpCapabilities});

         console.log("device is created and loaded ");

         this.#socket?.send(
            JSON.stringify({
               type: "client-rtpCapabilites",
               clientRtpCapabilities: this.#device.rtpCapabilities,
            })
         );

         return { status: true };
      } catch (error) {
         console.log("error in creating the device ", error);
         return { status: false };
      }
   };


    #createSendTransportFunc = (sendTransportOptions: TransportOptions ) => {
         if (!this.#device) {
            throw new Error("device is not present");
         }
         console.log("sendTransOptions", sendTransportOptions);
   
         const sendTranport: Transport =
            this.#device.createSendTransport(sendTransportOptions);
   
         sendTranport.on("connect", ({ dtlsParameters }, callback, errback) => {
            try {
               if (!this.#socket) {
                  throw new Error("socket not found in createSendTransport");
               }
               this.#socket.send(
                  JSON.stringify({
                     type: "sendTransport-connect",
                     roomId: this.currentRoomID,
                     dtlsParameters: dtlsParameters,
                  })
               );
   
               callback();
            } catch (error: unknown) {
               if (error instanceof Error) {
                  errback(error);
               } else {
                  console.log("error in createSendTransport not Error Instance", error);
               }
            }
         });
   
         sendTranport.on("produce", (parameters, callback, errback) => {
            const requestId = crypto.randomUUID();
            console.log("requestId in client producer",requestId);
   
            const pendingSettingData=this.#pendingCallbacks?.set(requestId, { callback, errback });
            console.log("pendingSettingData",pendingSettingData);
   
            const data = this.#socket?.send(
               JSON.stringify({
                  type: "transport-produce",
                  requestId,
                  transportId: sendTranport.id,
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
                  roomId:this.currentRoomID
               })
            );
   
            console.log("transport-producer sent to server");
         });
   
       this.#sendTransport = sendTranport;
      };

    #createRecvTransportFunc = (recvTransportOptions: TransportOptions) => {
      if (!this.#device) {
         throw new Error("device is not present in createRecv");
      }
      console.log("recvOptions=> ", recvTransportOptions);

      const recvTransport =
         this.#device.createRecvTransport(recvTransportOptions);

      recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
         try {
            if (!this.#socket) {
               throw new Error("socket not found in createSendTransport");
            }
            this.#socket.send(
               JSON.stringify({
                  type: "recvTransport-connect",
                  roomId: this.currentRoomID,
                  dtlsParameters: dtlsParameters,
               })
            );

            callback();
         } catch (error: unknown) {
            if (error instanceof Error) {
               errback(error);
            } else {
               console.log(
                  "error in recTransport connect not Error Instance",
                  error
               );
            }
         }
      });

      this.#recvTransport = recvTransport;
   };

    #getUserMediaAccess = async ():Promise<MediaStream> => {
       if (this.localStreams) {
          return this.localStreams;
       }
      const stream = await navigator.mediaDevices.getUserMedia({
         video: true,
         audio: true,
      });


      this.localStreams = stream;

       console.log("accessed userMedia");

      return stream
   };

    #createProducer = async () => {
      try {

          const stream=await this.#getUserMediaAccess();
         if (!this.#sendTransport) {
            throw new Error("clientSendTransport is not found");
         }
         if(!stream){
            throw new Error("localStream is not present");
         }
         const [videoTrack] = stream.getVideoTracks();

         if(!videoTrack){
            throw new Error("video Track is not found in createProducer");
         }
         const producerInstance = await this.#sendTransport.produce({
            track: videoTrack,
            encodings: [
               { maxBitrate: 100000 },
               { maxBitrate: 300000 },
               { maxBitrate: 900000 },
            ],
            codecOptions: {
               videoGoogleStartBitrate: 1000,
            },
         });

         console.log("client videoProducer created");
      } catch (error) {
         console.log("error in createProducer", error);
      }
   };
   



   disconnect(){
      if(this.#socket){
         this.#socket.close();
         // then i will do the media cleanup of that user

         console.log("socket successfully closed ")
      }else{
         console.log("socket was already closed");
      }
   }


}