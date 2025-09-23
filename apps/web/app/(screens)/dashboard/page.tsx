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

interface RoomList {
  roomName: string;
  roomId: string;
}

type RommListResponse = {
  status: string;
  message: string;
  data: RoomList[];
};

function Dashboard() {
  const setSocket = useSocket((state) => state.setSocket);
  const socket = useSocket((state) => state.socket);

  const setUserId = userDetail((state) => state.setUserId);
  const addRoom = useSocket((state) => state.addRoom);
  const setCurrentRoomId = useSocket((state) => state.setCurrentRoomId);

  const addMessage = allMessage((state) => state.addMessage);

  useEffect(() => {
    const getTokenAndConnect = async () => {
      try {
        const res = await fetch("/api/token");
        const data = await res.json();

        console.log(data, "data of the user");

        if (data.token) {
          const connection = new WebSocket(
            `ws://localhost:8080?token=${data.token}`,
          );
          connection.onopen = () => {
            connection.send(JSON.stringify("hi there from frontend"));
          };
          connection.onmessage = (event) => {
            try {
              console.log(event.data, "event data ");
              const parseddData = JSON.parse(event.data);
              console.log(parseddData, "parsedData");

              const modifiedMessage = {
                userId: parseddData.userId,
                id: nanoid(),
                name: parseddData.name,
                message: parseddData.message,
                time: parseddData.time,
              };
				  

              if (parseddData.roomId && parseddData) {
                addMessage(parseddData.roomId, modifiedMessage);
              } else {
                console.log(
                  "error in adding the message parsed data is   ",
                  parseddData,
                );
              }
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
              withCredentials: true,
            },
          );

          if (roomList.data.status !== "success") {
            throw new Error("fetching room failed");
          }

          if (connection && data.id) {
            if (roomList.data.data) {
              roomList.data.data.forEach((item) => {
                connection.send(
                  JSON.stringify({
                    type: "join_room",
                    roomId: item.roomId,
                  }),
                );
              });
              console.log("connection is made with all the roomlist");
            } else {
              console.log(
                "room list is not present so connection are not made to websocket ",
                roomList.data.data,
              );
            }
          }

          setSocket(connection);

          // i want to store userId as a string but it is getting stored as object if i set data.data.id the and remove the accessing of userId
          setUserId(data.id);
          console.log("roomList", roomList.data.data);
          if (roomList.data.data.length !== 0) {
            addRoom(roomList.data.data);
            if (roomList.data.data[0]?.roomId) {
              setCurrentRoomId(roomList.data.data[0]?.roomId);
            }
          }
        }
      } catch (error) {
        console.log("error in useeffect dashboard", error);
      }
    };
    if (!socket) {
      getTokenAndConnect();
    }
  }, []);

  return (
		<>
			<div className="bg-black/60">
				<div className="grid grid-cols-4 flex-1 overflow-hidden ">
					<div className="flex flex-col">
						<h1 className="text-4xl mb-5.5 font-bold ">PaaPay Chat</h1>
						<CreateRoom />
						<JoinRoom />
						<ListRooms classes={"overflow-y-auto border-1"} />
					</div>

					<div className="flex flex-col h-screen w-full col-span-3">
						<RoomHeading />
						<div className="relative overflow-y-auto border-1 w-full h-screen ">
							<ShowMessage />
						</div>
						<SendMessage />
					</div>
				</div>
			</div>
		</>
	);
}

export default Dashboard;
