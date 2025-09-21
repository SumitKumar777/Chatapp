"use client"
import { useEffect } from "react";
import CreateRoom from "../../component/CreateRoom";
import JoinRoom from "../../component/JoinRoom";
import useSocket from "../../store/hooks/useSocket";
import ListRooms from "../../component/ListRoom";
import ShowMessage from "../../component/ShowMessage";
import userDetail from "../../store/hooks/userDetails";
import axios from "axios";



interface RoomList{
	roomName:string,
	roomId:string,
}

type RommListResponse={
	status:string,
	message:string,
	data:RoomList[]
}



function Dashboard() {
   const  setSocket  = useSocket((state)=>state.setSocket);
	const socket=useSocket((state)=>state.socket);
   const setMessage=useSocket((state)=>state.setMessage);
	const setUserId=userDetail((state)=>state.setUserId);
	const addRoom=useSocket((state)=>state.addRoom);
	const setCurrentRoomId=useSocket((state)=>state.setCurrentRoomId);


	useEffect(() => {
			const getTokenAndConnect = async () => {
			try {
					const res = await fetch("/api/token");
					const data = await res.json();

					console.log(data, "data of the user");

					if (data.token) {
						const connection = new WebSocket(
							`ws://localhost:8080?token=${data.token}`
						);
						connection.onopen = () => {
							connection.send(JSON.stringify("hi there from frontend"));
						};
						connection.onmessage = (event) => {
							try {
								console.log(event.data, "event data ");
								const parseddData = JSON.parse(event.data);
								console.log(parseddData, "parsedData");
								setMessage(parseddData);
							} catch (error: unknown) {
								if (error instanceof Error) {
									console.log(event.data, "webSocket message in string");
									console.log(error.message, "in client on message");
								} else {
									console.log("unexpected error in dashboard onmessage", error);
								}
							}
						};
						connection.onclose = () => {
							console.log("connection cloesed on dashboard ");
						};

						const roomList = await axios.get<RommListResponse>(
							`${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllRooms`,
							{
								withCredentials:true
							}
						);

						if (roomList.data.status !== "success") {
							throw new Error("fetching room failed");
						}

						setSocket(connection);
						setUserId(data.id);
						console.log("roomList",roomList.data.data);
						if(roomList.data.data.length!==0){
							
								addRoom(roomList.data.data);
								if(roomList.data.data[0]?.roomId){
										setCurrentRoomId(roomList.data.data[0]?.roomId);
								}
							
						}
					}


			} catch (error) {
				console.log("error in useeffect dashboard",error);
			}
				
			};
			if(!socket){
				getTokenAndConnect();
			}
		}, []);		



   return (
			<>
				<div className="flex flex-col h-screen">
					
					<h1 className="text-2xl">hi there from chat app dashboard</h1>

				
					<div className="grid grid-cols-2">
						<CreateRoom />
						<JoinRoom />
					</div>

				
					<div className="grid grid-cols-4 flex-1 overflow-hidden pt-10  ">
						<ListRooms classes={"overflow-y-auto border-1"}/>
						<div className="col-span-3 relative overflow-y-auto border-1 ">
							<ShowMessage />
						</div>
					</div>
				</div>
			</>
		);
    
}

export default Dashboard;