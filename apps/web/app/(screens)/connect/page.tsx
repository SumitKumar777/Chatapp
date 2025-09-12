"use client";

import { useEffect, useState } from "react";


interface RequestData{
   type:string,
   roomId:string,
   message?:string
   
}

export default function Connect() {
   const [socket,setSocket]=useState<WebSocket|null>(null);
   const [message, setMesssage] = useState<string|null>(null);
   const [roomId,setRoomId]=useState<string|null>(null);
   const [page,setPage]=useState<boolean>(true);


   useEffect(()=>{
      const connection = new WebSocket("ws://localhost:8080");
      connection.onopen=()=>{
         connection.send("hi there from frontend");
      }
      connection.onmessage=(data)=>{
         console.log(data.toString());
         setMesssage(data.toString());
      }
      setSocket(socket);
      return ()=> connection.close();
   },[])

   const sendRequest=(reqData:RequestData)=>{
      if(!socket){
         console.log("socket not defined in send Request");
         return ;
      }
      socket.send(JSON.stringify(reqData));

   }

   const joinRoom=(e:React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();

      const form=new FormData(e.currentTarget);
      const roomId=form.get("roomId") as string;
      console.log(roomId,"roomId in the client");
      setRoomId(roomId);
      const data={
         type:"join_room",
         roomId:roomId as string
      }

      sendRequest(data)
   }
    const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			const form = new FormData(e.currentTarget);
			const message = form.get("message") as string;
			console.log(message, "message in the client");
			const data = {
				type: "chat",
				roomId:roomId as string,
            message
			};

			sendRequest(data);
		};

	return (
		<>
			<div>
				<div className="flex space-x-6">
					<button onClick={() => setPage(true)}>Room</button>
					<button onClick={() => setPage(false)}>Message</button>
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
							<button type="submit" className="text-2xl">
								Connect
							</button>
						</form>
					) : (
						<form onSubmit={sendMessage}>
							<label htmlFor="message">
								Send Message to  room
								<br />
								<input
									type="text"
									placeholder="send message"
									name="message"
								/>
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
