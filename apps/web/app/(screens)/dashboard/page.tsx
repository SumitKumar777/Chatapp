"use client";
import { useEffect } from "react";
import CreateRoom from "../../component/CreateRoom";
import JoinRoom from "../../component/JoinRoom";
import useSocket from "../../store/hooks/useSocket";
import ListRooms from "../../component/ListRoom";
import ShowMessage from "../../component/ShowMessage";
import userDetail from "../../store/hooks/userDetails";
import axios from "axios";
import allMessage from "../../store/hooks/allMessage";
import { nanoid } from "nanoid";
import RoomHeading from "../../component/RoomHeading";
import SendMessage from "../../component/SendMessage";
import userUtils from "../../store/hooks/userUtils";
import Button from "../../component/Button";
import UserAvatar from "../../component/UserAvatar";
import { useRouter } from "next/dist/client/components/navigation";
import  Logout  from "../../component/Logout";


interface RoomList {
  roomName: string;
  roomId: string;
}

type RommListResponse = {
  status: string;
  message: string;
  data: RoomList[];
};

type MessageType={
  roomId:string;
  userId:string;
  name:string;
  message:string;
  time:string;
}




function Dashboard() {
  const setSocket = useSocket((state) => state.setSocket);
  const socket = useSocket((state) => state.socket);
  const userName = userDetail((state) => state.username);
  const router=useRouter();

  const setUserId = userDetail((state) => state.setUserId);
  const addRoom = useSocket((state) => state.addRoom);
  const setCurrentRoomId = useSocket((state) => state.setCurrentRoomId);
  const setCurrentRoomName = useSocket((state) => state.setCurrentRoomName);

  const addMessage = allMessage((state) => state.addMessage);
  const setUserName = userDetail((state) => state.setUserName);
  const isSidebarOpen = userUtils((state) => state.isSidebarOpen);

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    const getTokenAndConnect = async () => {
      try {
        const res = await fetch("/internal/token");
        const data = await res.json();

          const roomList = await axios.get<RommListResponse>( `${BACKEND_URL}/api/room/getAllRooms`,
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
          connection.onmessage = (event) => {
            const data = event.data;


            let parsedData: MessageType;
							try {
								parsedData = JSON.parse(data);
							} catch {
								return;
							}

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
          };
          connection.onclose = () => {
            console.log("connection closed on dashboard ");
            if (hasOpened) {
              setSocket(null);
            } else {
              console.log(
                "connection closed without opening, likely auth failed",
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
      } catch (error:unknown) {
        if (error instanceof Error) {
          console.log(error.message, "error instance of error in dashboard useeffect");
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

  return (
		<>
			<div className="bg-black/60 w-full h-full">
				<div className="grid grid-cols-1 md:grid-cols-4 flex-1 overflow-hidden w-full">
					<div className={` ${isSidebarOpen ? "block" : "hidden"} flex flex-col md:block md:col-span-1  h-screen `}>
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
                  <UserAvatar  name={userName} />
                  <Button className="bg-gray-700 text-white"  onClick={async () => {
                    await Logout();

                    router.push("/signin");

                  }}>Logout</Button>
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
