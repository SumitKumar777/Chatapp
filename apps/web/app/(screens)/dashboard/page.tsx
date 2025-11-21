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
  const setCurrentRoomName = useSocket((state) => state.setCurrentRoomName);

  const addMessage = allMessage((state) => state.addMessage);
  const setUserName = userDetail((state) => state.setUserName);
  const isSidebarOpen = userUtils((state) => state.isSidebarOpen);

  useEffect(() => {
    const getTokenAndConnect = async () => {
      try {
        const res = await fetch("/api/token");
        const data = await res.json();

        console.log(data, "data of the user");

        if (data.token) {
          const connection = new WebSocket(
						`${process.env.NEXT_PUBLIC_WEBSOCKET_BACKEND_URL}?token=${data.token}`
					);
          let hasOpened = false;
          connection.onopen = () => {
            hasOpened = true;
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

          const roomList = await axios.get<RommListResponse>(
            process.env.NODE_ENV === "development"
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/getAllRooms`
              : "/api/getAllRooms",
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
          console.log(data.id, "userId setting in dashboard");
          setUserId(data.id.id);
          setUserName(data.id.username);

          console.log("roomList", roomList.data.data);
          if (roomList.data.data.length !== 0) {
            addRoom(roomList.data.data);
            if (roomList.data.data[0]?.roomId) {
              setCurrentRoomId(roomList.data.data[0]?.roomId);
              setCurrentRoomName(roomList.data.data[0]?.roomName);
            }
          }
        }
      } catch (error) {
        console.log("error in useeffect dashboard", error);
      }
    };
    console.log("outside the useeffect of socket", socket);
    if (!socket && socket === null) {
      console.log("inside socket of the dashboard", socket);
      getTokenAndConnect();
    }
  }, [socket]);

  return (
    <>
      <div className="bg-black/60 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 flex-1 overflow-hidden w-full">
          <div
            className={`flex flex-col h-screen ${isSidebarOpen ? null : "hidden"} md:block md:col-span-1`}
          >
            <h1 className="text-4xl mb-5.5 font-bold pl-4 ">PaaPay Chat</h1>
            <div className="pl-4 space-x-4 w-full flex ">
              <CreateRoom />
              <JoinRoom />
            </div>
            <ListRooms classes={"overflow-y-scroll border-1 h-full pl-2"} />
          </div>

          <div
            className={` ${isSidebarOpen ? "hidden" : "block"} md:block flex flex-col h-screen w-full col-span-1 md:col-span-3`}
          >
            <div className="h-full flex flex-col overflow-hidden justify-between">
              <RoomHeading  />
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
