"use client"
import { useEffect } from "react";
import CreateRoom from "../../component/CreateRoom";
import JoinRoom from "../../component/JoinRoom";
import useSocket from "../../store/hooks/useSocket";
import ListRooms from "../../component/ListRoom";
import ShowMessage from "../../component/ShowMessage";

function Dashboard() {
   const  setSocket  = useSocket((state)=>state.setSocket);
	const socket=useSocket((state)=>state.socket);
   const setMessage=useSocket((state)=>state.setMessage);


		useEffect(() => {
			const getTokenAndConnect = async () => {
				const res = await fetch("/api/token");
				const data = await res.json();

				if (data.token) {
					const connection = new WebSocket(
						`ws://localhost:8080?token=${data.token}`
					);
					connection.onopen = () => {
						connection.send(JSON.stringify("hi there from frontend"));
					};
					connection.onmessage = (event) => {
						try {
							console.log(event.data,"event data ");
							const parseddData=JSON.parse(event.data);
							console.log(parseddData,"parsedData");
							setMessage(parseddData);

						} catch (error:unknown) {
							if(error instanceof Error){
                       console.log(event.data, "webSocket message in string");
								console.log(error.message,"in client on message");
                     }else{
									
                        console.log("unexpected error in dashboard onmessage",error)
                     }
						}
					};
					connection.onclose=()=>{
						console.log("connection cloesed on dashboard ");
					}

					setSocket(connection);
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

				
					<div className="grid grid-cols-3 flex-1 overflow-hidden pt-10  ">
						<ListRooms classes={"overflow-y-auto border-1"}/>
						<div className="col-span-2 relative overflow-y-auto border-1 ">
							<ShowMessage />
						</div>
					</div>
				</div>
			</>
		);
    
}

export default Dashboard;