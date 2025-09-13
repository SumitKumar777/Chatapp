"use client";

import { useEffect, useState } from "react";


interface RequestData{
   type:string,
   roomId:string,
   message?:string
}


export default function Connect() {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [roomId, setRoomId] = useState<string | null>(null);
	const [page, setPage] = useState<boolean>(true);

	  useEffect(() => {
			const getTokenAndConnect = async () => {
				const res = await fetch("/api/token"); 
				const data = await res.json();

				if (data.token) {
					const connection = new WebSocket(
						`ws://localhost:8080?token=${data.token}`
					);
					connection.onopen = () => {
						connection.send(JSON.parse("hi there from frontend"));
					};
					connection.onmessage = (event) => {
						console.log(event.data);
                  setMessage((event.data));
					};
					setSocket(connection);
				}
			};

			getTokenAndConnect();
		}, []);

      const sendRequest=(data:RequestData)=>{
         if(!socket){
            console.log("socket is not present");
            return ;
         }
		 socket.send(JSON.stringify(data));
      }

	const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = new FormData(e.currentTarget);
		const roomId = form.get("roomId") as string;
		console.log(roomId, "roomId in the client");
		setRoomId(roomId);
		const data = {
			type: "join_room",
			roomId: roomId as string,
		};

		sendRequest(data);
	};
	const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const form = new FormData(e.currentTarget);
		const message = form.get("message") as string;
		console.log(message, "message in the client");
		const data = {
			type: "message",
			roomId: roomId as string,
			message,
		};

		sendRequest(data);
	};

	return (
		<>
			<div>
				<div className="flex space-x-6  ">
					<button className="border-2 bg-red-200" onClick={() => setPage(true)}>
						Room
					</button>
					<button className="border-2" onClick={() => setPage(false)}>
						Message
					</button>
				</div>
				<div>
					{page ? (
						<form onSubmit={joinRoom}>
							<label htmlFor="roomId">
								Join a room
								<br />
								<input
									type="text"
									placeholder="enter room name"
									name="roomId"
								/>
							</label>
							<br />
							<button type="submit" className="text-2xl" >
                     Connect
							</button>
						</form>
					) : (
						<form onSubmit={sendMessage}>
							<label htmlFor="message">
								Send Message to room
								<br />
								<input type="text" placeholder="send message" name="message" />
							</label>
							<br />
							<button type="submit" className="text-2xl">
								send message
							</button>
						</form>
					)}
				</div>
				<div>{message && <p className="test-xl">{message}</p>}</div>
			</div>
		</>
	);
}
