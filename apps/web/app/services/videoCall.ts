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
   > | null = null;
    localStreams:MediaStream|null=null;
    currentRoomID:string|null=null;
    remoteStream:MediaStream|null=null;


   static getInstance(){
      if(!this.#videoInstance){
         return this.#videoInstance=new VideoCall();
      }
      return this.#videoInstance;
   }

   async connect(authtoken:string){
      if(this.#socket)return;


      const connection = new WebSocket(`ws://localhost:8080/ws/video?token${authtoken}`);

      connection.onopen=()=>{
         this.#socket=connection;
         console.log("connection is made in vidoCall");
      }

      connection.onmessage=async (message)=>{
         let parsedData;

         try {
            parsedData=JSON.parse(message.toString())
         } catch  {
            console.log("received non json data",message.toString())
         }

         const type = parsedData.type;

         if(!type){
            console.log("type property is missing");
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
               if(!this.#pendingCallbacks){
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
            }
         }

         if (type === "createdConsumerResponse") {
            try {
               if (parsedData.success) {
                  const localConsumer =
                     await this.#recvTransport?.consume(
                        parsedData.consumerOptions
                     );

                  if (!localConsumer) {
                     throw new Error("cosumer not created");
                  }

                  console.log("localConsumer",localConsumer);


                  const { track } = localConsumer;

                  if (!this.remoteStream) {
                     this.remoteStream = new MediaStream();
                  }
                  this.remoteStream.addTrack(track);

                  connection.send(JSON.stringify({ type: "resumeConsumer", consumerId: parsedData.consumerOptions.id,roomId:this.currentRoomID }))
               } else {
                  console.log("consumer not created");
               }
            } catch (error) {
               console.log("error in the createdConsumerResponse", error);
            }
         }

         await new Promise<void>(resolve => {
            setTimeout(() => {
               console.log("artificial sleep");
               resolve();
            }, 3000);
         });

      }
   }
   
   initVideoCall = (currentRoomId:string) => {
      this.currentRoomID=currentRoomId;
      this.#socket?.send(
         JSON.stringify({ type: "startVideoCall", roomId: currentRoomId })
      );
      // setLoading = true and make it false when the user gets message on the socket
      console.log("initVideoFuncCalled");
   };


   #createDevice = async (
      routerRtpCapabilities: any
   ): Promise<{ status: true | false }> => {
      try {
         const deviceInstance = new Device();

         await deviceInstance.load(routerRtpCapabilities);

         this.#device = deviceInstance;

         console.log("device is created and loaded ");

         this.#socket?.send(
            JSON.stringify({
               type: "client-rtpCapabilites",
               clientRtpCapabilities: deviceInstance.rtpCapabilities,
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
   
            this.#pendingCallbacks?.set(requestId, { callback, errback });
   
            const data = this.#socket?.send(
               JSON.stringify({
                  type: "transport-produce",
                  requestId,
                  transportId: sendTranport.id,
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
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