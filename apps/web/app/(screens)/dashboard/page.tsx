"use client";
import axios from "axios";
import { nanoid } from "nanoid";
import { useEffect, useRef } from "react";
import Button from "../../component/Button";
import Logout from "../../component/Logout";
import JoinRoom from "../../component/JoinRoom";
import ListRooms from "../../component/ListRoom";
import useSocket from "../../store/hooks/useSocket";
import CreateRoom from "../../component/CreateRoom";
import ShowMessage from "../../component/ShowMessage";
import userDetail from "../../store/hooks/userDetails";
import allMessage from "../../store/hooks/allMessage";
import RoomHeading from "../../component/RoomHeading";
import SendMessage from "../../component/SendMessage";
import userUtils from "../../store/hooks/userUtils";
import UserAvatar from "../../component/UserAvatar";
import { useRouter } from "next/dist/client/components/navigation";

import { Device } from "mediasoup-client";
import {
	RtpCapabilities,
	Transport,
	TransportOptions,
} from "mediasoup-client/types";

interface RoomList {
	roomName: string;
	roomId: string;
}

type RommListResponse = {
	status: string;
	message: string;
	data: RoomList[];
};

type MessageType = {
	type: string;
	roomId: string;
	userId: string;
	name: string;
	message: string;
	time: string;
};

function Dashboard() {
	const router = useRouter();
	const socket = useSocket((state) => state.socket);
	const setSocket = useSocket((state) => state.setSocket);
	const userName = userDetail((state) => state.username);
	const setUserId = userDetail((state) => state.setUserId);
	const addRoom = useSocket((state) => state.addRoom);
	const currentRoomId = useSocket((state) => state.currentRoomId);
	const setCurrentRoomId = useSocket((state) => state.setCurrentRoomId);
	const setCurrentRoomName = useSocket((state) => state.setCurrentRoomName);
	const addMessage = allMessage((state) => state.addMessage);
	const setUserName = userDetail((state) => state.setUserName);
	const isSidebarOpen = userUtils((state) => state.isSidebarOpen);

	const device = useRef<Device | null>(null);
	const userSendTranport = useRef<Transport | null>(null);
	const userRecvTransport = useRef<Transport | null>(null);
	const localStreams = useRef<MediaStream | null>(null);
	const localVideoRef = useRef<HTMLVideoElement | null>(null);
	const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

	const pendingCallbacks = useRef<
		Map<string, { callback: Function; errback: Function }>
	>(new Map());

	const BACKEND_URL =
		process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

	useEffect(() => {
		const getTokenAndConnect = async () => {
			try {
				const res = await fetch("/internal/token");
				const data = await res.json();

				const roomList = await axios.get<RommListResponse>(
					`${BACKEND_URL}/api/room/getAllRooms`,
					{
						withCredentials: true,
					}
				);
				if (roomList.data.status !== "success") {
					throw new Error("fetching room failed");
				}

				if (data.token) {
					const connection = new WebSocket(
						`${process.env.NEXT_PUBLIC_WEBSOCKET_BACKEND_URL}/ws?token=${data.token}`
					);

					let hasOpened = false;

					connection.onopen = () => {
						hasOpened = true;

						if (connection && data.id) {
							if (roomList.data.data) {
								roomList.data.data.forEach((item) => {
									connection.send(
										JSON.stringify({
											type: "join_room",
											roomId: item.roomId,
										})
									);
								});
							} else {
								console.log(
									"room list is not present so connection are not made to websocket ",
									roomList.data.data
								);
							}
						}
						connection.send(JSON.stringify("hi there from frontend"));
					};
					connection.onmessage = async (event) => {
						const data = event.data;

						let parsedData;
						try {
							parsedData = JSON.parse(data);
						} catch {
							return;
						}

						const type = parsedData.type;

						if (type === "messageBrodcasted") {
							try {
								const modifiedMessage = {
									userId: parsedData.userId,
									id: nanoid(),
									name: parsedData.name,
									message: parsedData.message,
									time: parsedData.time,
								};

								addMessage(parsedData.roomId, modifiedMessage);
							} catch (error: unknown) {
								if (error instanceof Error) {
									console.log(error.message, "in client on message");
								} else {
									console.log("unexpected error in dashboard onmessage", error);
								}
							}
						}

						if (type === "transportOptions") {
							try {
								const {
									routerRtpCapabilities,
									sendTransportOptions,
									recvTransportOptions,
								} = parsedData;
								const deviceResult = await createDevice(routerRtpCapabilities);

								if (!deviceResult.status) {
									throw new Error("device Creation failed");
								}

								createSendTransport(sendTransportOptions);
								createRecvTransport(recvTransportOptions);
							} catch (error) {
								console.log(
									"error on TransportOptions on webSocketConnection",
									error
								);
							}
						}

						if (type === "producerCreated") {
							try {
								const pendingCalls = pendingCallbacks.current.get(
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
											roomId: currentRoomId,
											producerId: parsedData.producerId,
											clientRtpCapabilites: device.current?.rtpCapabilities,
										})
									);
								} else {
									pendingCalls.errback(parsedData.error);
								}

								pendingCallbacks.current.delete(parsedData.requestId);
							} catch (error) {
								console.log("error in producer created", error);
							}
						}

						if (type === "createdConsumerResponse") {
							try {
								if (parsedData.success) {
									const localConsumer =
										await userRecvTransport.current?.consume(
											parsedData.consumerOptions
										);

									if (!localConsumer) {
										throw new Error("cosumer not created");
									}

									const { track } = localConsumer;
									// remoteVideoRef.current?.srcObject= new MediaStream([track]);
								} else {
									console.log("consumer not created");
								}
							} catch (error) {
								console.log("error in the createdConsumerResponse", error);
							}
						}
					};
					connection.onclose = () => {
						console.log("connection closed on dashboard ");
						if (hasOpened) {
							setSocket(null);
						} else {
							console.log(
								"connection closed without opening, likely auth failed"
							);
						}
					};
					connection.onerror = (error) => {
						console.log("error in connection", error);
						if (hasOpened) {
							setSocket(null);
						}
					};

					setSocket(connection);

					// i want to store userId as a string but it is getting stored as object if i set data.data.id the and remove the accessing of userId

					setUserId(data.id.id);
					setUserName(data.id.username);

					if (roomList.data.data.length !== 0) {
						addRoom(roomList.data.data);
						if (roomList.data.data[0]?.roomId) {
							setCurrentRoomId(roomList.data.data[0]?.roomId);
							setCurrentRoomName(roomList.data.data[0]?.roomName);
						}
					}
				}
			} catch (error: unknown) {
				if (error instanceof Error) {
					console.log(
						error.message,
						"error instance of error in dashboard useeffect"
					);
					return;
				}
				console.log("unexpected error in useeffect dashboard", error);
				return;
			}
		};

		if (!socket && socket === null) {
			getTokenAndConnect();
		}
	}, [socket]);

	const createDevice = async (
		routerRtpCapabilities: any
	): Promise<{ status: true | false }> => {
		try {
			const deviceInstance = new Device();

			await deviceInstance.load(routerRtpCapabilities);

			device.current = deviceInstance;

			console.log("device is created and loaded ");

			socket?.send(
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

	const createSendTransport = (sendTransportOptions: TransportOptions) => {
		if (!device.current) {
			throw new Error("device is not present");
		}
		console.log("sendTransOptions", sendTransportOptions);

		const sendTranport: Transport =
			device.current.createSendTransport(sendTransportOptions);

		sendTranport.on("connect", ({ dtlsParameters }, callback, errback) => {
			try {
				if (!socket) {
					throw new Error("socket not found in createSendTransport");
				}
				socket.send(
					JSON.stringify({
						type: "sendTransport-connect",
						roomId: currentRoomId,
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

			pendingCallbacks.current.set(requestId, { callback, errback });

			const data = socket?.send(
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

		userSendTranport.current = sendTranport;
	};

	const createRecvTransport = (recvTransportOptions: TransportOptions) => {
		if (!device.current) {
			throw new Error("device is not present in createRecv");
		}
		console.log("recvOptions=> ", recvTransportOptions);

		const recvTransport =
			device.current.createRecvTransport(recvTransportOptions);

		recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
			try {
				if (!socket) {
					throw new Error("socket not found in createSendTransport");
				}
				socket.send(
					JSON.stringify({
						type: "recvTransport-connect",
						roomId: currentRoomId,
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

		userRecvTransport.current = recvTransport;
	};

	const initVideoCall = () => {
		socket?.send(
			JSON.stringify({ type: "startVideoCall", roomId: currentRoomId })
		);
		// setLoading = true and make it false when the user gets message on the socket
		console.log("initVideoFuncCalled");
	};

	const getUserMediaAccess = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});

		if (!localStreams.current) {
			localStreams.current = stream;
		}
		console.log("accessed userMedia");
	};

	const createProducer = async () => {
		try {
			if (!userSendTranport.current) {
				throw new Error("clientSendTransport is not found");
			}
			const videoTrack = localStreams.current?.getVideoTracks()[0];
			const producerInstance = await userSendTranport.current.produce({
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

	return (
		<>
			<div className="bg-black/60 w-full h-full">
				<div className="grid grid-cols-1 md:grid-cols-4 flex-1 overflow-hidden w-full">
					<div className={`flex flex-col md:block md:col-span-1  h-screen `}>
						<h1 className="text-4xl mb-5.5 font-bold pl-4 ">PaaPay Chat</h1>
						<div className="flex pl-4 space-x-4 w-full  ">
							<CreateRoom />
							<JoinRoom />
						</div>
						<ListRooms classes={"overflow-y-scroll border-1 h-screen pl-2"} />
					</div>
					<div
						className={` ${isSidebarOpen ? "hidden" : "block"} md:block flex flex-col h-screen w-full col-span-1 md:col-span-3`}
					>
						<div className="h-full flex flex-col overflow-hidden justify-between">
							<div className="flex justify-between ">
								<RoomHeading />
								<div className="flex items-center space-x-2 mr-4">
									<p className="bg-amber-300 text-2xl" onClick={initVideoCall}>
										V
									</p>
									<UserAvatar name={userName} />
									<Button
										className="bg-gray-700 text-white"
										onClick={async () => {
											await Logout();

											router.push("/signin");
										}}
									>
										Logout
									</Button>
								</div>
							</div>
							<div className="relative overflow-y-auto border-1 w-full h-full ">
								<ShowMessage />
							</div>
							<SendMessage className="h-fit" />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Dashboard;
