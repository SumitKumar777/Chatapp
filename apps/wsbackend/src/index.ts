import { WebSocket, WebSocketServer } from "ws";

import path from "path";
import { fileURLToPath } from "url";
import { getRouter, routerTransport } from "./medaisoup/index.js";
import {
	addUsertoRoom,
	allUser,
	AuthUser,
	authUser,
	brodcastMessage,
	removeUserfromRoom,
	UserInfo,
} from "./functions/func.js";
import {
  Consumer,
	Producer,
	ProducerOptions,
	Router,
	RtpCapabilities,
	WebRtcTransport,
} from "mediasoup/types";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.JWT_SECRET) {
	const dotenv = await import("dotenv");
	dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
}

if (!process.env.JWT_SECRET) {
	throw new Error("JWT_SECRET environment variable is required");
}

const wss = new WebSocketServer({ port: 8080 });

const routerToSendTransport: Map<Router, WebRtcTransport> = new Map();
const routerToRecvTransport: Map<Router, WebRtcTransport> = new Map();

const roomIdToRouter: Map<string, Router> = new Map();
const userToRouter: Map<string, Router[]> = new Map();

const sendTrnsToProducer: Map<WebRtcTransport, Producer[]> = new Map();
const recvTrnsToConsumer: Map<WebRtcTransport, Consumer[]> = new Map();

const clientToRtpCapabilites:Map<WebSocket,RtpCapabilities>=new Map();

const videoCallConnections:Map<WebSocket,UserInfo>= new Map();

type transportSuccess = {
	ok: true;
	routerRtpCapabilities: any;
	sendTransportOptions: any;
	recvTransportOptions: any;
};

type transportFailure = {
	ok: false;
	error: string;
};

type transportResult = transportSuccess | transportFailure;

type GetConsumerSuccess={
  success:true;
  consumer:Consumer;
}
type GetConsumerFailure = {
  success: false;
  error: Error;
}

type GetConsumerResult= GetConsumerFailure|GetConsumerSuccess;

const createProducer = async (produceOptions: ProducerOptions) => {
	try {
	} catch (error) {}
};

const createConsumer = async () => {};


const getConsumer=(consumerId:string,roomId:string):GetConsumerResult=>{
 try {
   if (!(consumerId && roomId)) {
     throw new Error("parameter are missing");
   }

   const getTransportInstance = getTransport(roomId, "receive")

   if(!getTransportInstance){
    throw new Error('transport not found');
   }

   const consumerInstance= recvTrnsToConsumer.get(getTransportInstance)?.filter(consumer=>consumer.id===consumerId)[0];

   if(!consumerInstance){
    throw new Error("consumer not found");
   }

   return {success:true,consumer:consumerInstance};

 } catch (error) {
  console.log("error in getting Consumer",error);
  if(error instanceof Error){
    return { success: false, error }
  }
   return { success: false, error:error as Error }
 }

}

const getTransport = (roomId: string, type: "send" | "receive") => {
	try {
		if(!roomId){
			console.log("type in roomId is not present ", type , "and roomId is ",roomId);
			throw new Error("roomId is not present  ", )
		}
		const roomRouter = roomIdToRouter.get(roomId);
		console.log("roomRouter in getTransport",roomRouter);
		if (!roomRouter) {
			throw new Error("router not found in connect");
		}

		const transport: WebRtcTransport =
			type === "send"
				? routerToSendTransport.get(roomRouter)!
				: routerToRecvTransport.get(roomRouter)!;

		if (!transport) {
			throw new Error("tranport not found in get Transport");
		}

		return transport;
	} catch (error) {
		console.log("error in getTransport ", error);
	}
};

const startVideoCall = async (
	roomId: string,
	connection: WebSocket
): Promise<transportResult> => {
	try {
		const routerInstance = await getRouter(roomId);
		if (!routerInstance) {
			console.log(
				"router creation failed in startVideoCall => ",
				routerInstance
			);
			throw new Error("router not created");
		}

		const roomRouter = roomIdToRouter.get(roomId);

		if (!roomRouter) {

			roomIdToRouter.set(roomId, routerInstance);
		}



		const sendTransport = await routerTransport(routerInstance);
		const recvTransport = await routerTransport(routerInstance);

		const userId = videoCallConnections.get(connection)?.userId;

		if (!userId) {
			console.log("userId ", userId);
			throw new Error("userId is not found ");
		}

		let existingUserRouters = userToRouter.get(userId);

		if (!existingUserRouters) {
			existingUserRouters = [];
			userToRouter.set(userId, existingUserRouters);
		}
		existingUserRouters.push(routerInstance);

		const existingRouterSendTransports =
			routerToSendTransport.get(routerInstance);

		if (!existingRouterSendTransports) {
			routerToSendTransport.set(routerInstance, sendTransport);
		}

		const existingRouterRecvTransport =
			routerToRecvTransport.get(routerInstance);

		if (!existingRouterRecvTransport) {
			routerToRecvTransport.set(routerInstance, recvTransport);
		}

		const sendTransportOptions = {
			id: sendTransport.id,
			iceParameters: sendTransport.iceParameters,
			iceCandidates: sendTransport.iceCandidates,
			dtlsParameters: sendTransport.dtlsParameters,
		};
		const recvTransportOptions = {
			id: recvTransport.id,
			iceParameters: recvTransport.iceParameters,
			iceCandidates: recvTransport.iceCandidates,
			dtlsParameters: recvTransport.dtlsParameters,
		};

		return {
			ok: true,
			routerRtpCapabilities: routerInstance.rtpCapabilities,
			sendTransportOptions,
			recvTransportOptions,
		};
	} catch (error) {
		let errorMessage;
		if (error instanceof Error) {
			console.log("error in start VedioCall", error);
			errorMessage = error.message as string;
		}
		if (!errorMessage) {
			console.log("error message not present", errorMessage);
		}

		return { ok: false, error: errorMessage! };
	}
};


wss.on("connection", (ws, request) => {
	ws.on("error", (err) => console.log(err));

	const user: AuthUser = authUser(request.url as string);

	if (!user.success || !user.userId || !user.username) {
		ws.send("not authenticated");
		ws.close();
		return;
	}
	if(user.type==="chat"){
		allUser.set(ws, { userId: user.userId, username: user.username });
	}else{
		videoCallConnections.set(ws, { userId: user.userId, username: user.username });
	}
	
	

	ws.on("message", async (data: string) => {
		try {
			const parsedData = JSON.parse(data);
			const { type, roomId, message, ...rest } = parsedData;

			if (type === "join_room") {
				addUsertoRoom(roomId, ws);
			}
			if (type === "leave_room") {
				removeUserfromRoom(roomId, ws);
			}
			if (type === "message") {
				brodcastMessage(roomId, message!, ws);
			}

			if (type === "startVideoCall") {
				try {
					const callResult = await startVideoCall(roomId, ws);

					if (!callResult.ok) {
						console.log("error in startVideoCall", callResult.error);
						throw new Error("error while startVideocall");
					}

					ws.send(
						JSON.stringify({
							type: "transportOptions",
							routerRtpCapabilities: callResult.routerRtpCapabilities,
							sendTransportOptions: callResult.sendTransportOptions,
							recvTransportOptions: callResult.recvTransportOptions,
						})
					);
				} catch (error) {
					console.log(error);
				}
			}

      if (type ==="client-rtpCapabilites"){
        const clientRtpCapabilites = parsedData.clientRtpCapabilities;
        if(!clientRtpCapabilites){
          console.log("clientRtpCapabilites is not present");
        }else{
          clientToRtpCapabilites.set(ws,clientRtpCapabilites);
        }

      }

		if (type === "sendTransport-connect") {
			try {
				const sendTransportInstance = getTransport(roomId, "send");

				if (!sendTransportInstance) {
					throw new Error("sendTranport not in tranport connect");
				}

				console.log("rest body in sendTransport-connect", rest.dtlsParameters.fingerprints);

				await sendTransportInstance.connect({
					dtlsParameters: rest.dtlsParameters
				});

				console.log("transport connected");
			} catch (error) {
				console.log("error in send tranport connect", error);
			}
		}

		if (type === "recvTransport-connect") {
			try {
				const recvTranportInstance = getTransport(roomId, "receive");

				if (!recvTranportInstance) {
					throw new Error("recvTranport not in tranport connect");
				}

				await recvTranportInstance.connect(rest.dtlsParameters);

				console.log("transport connected");
			} catch (error) {
				console.log("error in recv tranport connect", error);
			}
		}

		if (type === "transport-produce") {
			try {
				const sendTransportInstance = getTransport(roomId, "send");

				if (!sendTransportInstance) {
					throw new Error("sendTranport not in producer creation ");
				}

				const producerInstance = await sendTransportInstance.produce({
					kind: rest.kind,
					rtpParameters: rest.rtpParameters,
				});

				let existingProducer = sendTrnsToProducer.get(sendTransportInstance);

				if (!existingProducer) {
					existingProducer = [];
					sendTrnsToProducer.set(sendTransportInstance, existingProducer);
				}

				existingProducer.push(producerInstance);

				ws.send(
					JSON.stringify({
						type: "producerCreated",
						success: true,
						producerId: producerInstance.id,
						requestId: parsedData.requestId,
					})
				);

				console.log("producer created ");
			} catch (error) {
				console.log("error in  transport-produce tranport connect", error);
				ws.send(
					JSON.stringify({
						type: "producerCreated",
						success: false,
						requestId: parsedData.requestId,
				error
					})
				);
			}
		}

      if (type ==="createConsumer"){
       try {
         const { roomId, producerId, clientRtpCapabilites } = parsedData;

         if (!(roomId && producerId && clientRtpCapabilites)) {
           console.log("roomId => ", roomId, "producerId", producerId, "clientRtpCapabilites => ", clientRtpCapabilites);
           throw new Error("client request parameters are missing")
         }
         
         const routerInstance = roomIdToRouter.get(roomId);

         if(!routerInstance){
          throw new Error("router is missing");
         }

         if (!(routerInstance.canConsume({ producerId, rtpCapabilities: clientRtpCapabilites }))){
          console.log("consumption failed");
          throw new Error("consumption failed");
         }

         const recvTranportInstance=routerToRecvTransport.get(routerInstance);
         
         if(!recvTranportInstance){
          console.log("recv transport is not found");
          throw new Error("transport not found");
         }

         const newConsumer= await recvTranportInstance.consume(
          {
             producerId:producerId,
             rtpCapabilities:clientRtpCapabilites,
             paused:true
          }
         )


         let existingConsumer= recvTrnsToConsumer.get(recvTranportInstance);

         if(!existingConsumer){
          existingConsumer=[];
          recvTrnsToConsumer.set(recvTranportInstance,existingConsumer);
         }

         existingConsumer.push(newConsumer);

         const consumerOptions={
          id:newConsumer.id,
          producerId,
          kind:newConsumer.kind,
          rtpParameters:newConsumer.rtpParameters
         }


         ws.send(JSON.stringify({type:"createdConsumerResponse",success:true,consumerOptions}))

       } catch (error) {
        console.log("error in the createConsumer",error);
         ws.send(JSON.stringify({ type:"createdConsumerResponse",success:false}))
       }
      }
      if (type ==="resumeConsumer"){
        // implement the resuming logic
        try {
          if(!rest.consumerId){
            throw new Error("consumerId is missing in parsedData");
          }
          const consumerInstance = getConsumer(rest.consumerId,roomId);

          if(!consumerInstance.success){
            throw new Error("failed to get Consumer");
          }

          consumerInstance.consumer.resume();
          console.log("consumer resumed");
          

        } catch (error) {
          console.log("error in resumerConsuemr",error);
        }
      }
		} catch (error) {
			console.log(data.toString(), "data in the websocket");
			console.log(error, "error in the message");
		}
	});
	ws.send("hi from the server");
});
