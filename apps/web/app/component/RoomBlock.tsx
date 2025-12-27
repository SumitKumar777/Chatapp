"use client";

import axios from "axios";
import useSocket, { Rooms } from "../store/hooks/useSocket";
import userUtils from "../store/hooks/userUtils";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@web/components/ui/spinner";

function RoomBlock({ roomName, roomId }: Rooms) {
  const setCurrentRoomId = useSocket((state) => state.setCurrentRoomId);
  const socket = useSocket((state) => state.socket);
  const room = useSocket((state) => state.rooms);
  const deleteRoom = useSocket((state) => state.deleteRoom);
  const deleteMessage = useSocket((state) => state.deleteMessage);
  const currentRoomId = useSocket((state) => state.currentRoomId);
  const setCurrentRoomName = useSocket((state) => state.setCurrentRoomName);
  const setIsSidebarOpen = userUtils((state) => state.setIsSidebarOpen);
  const [loading, setLoading] = useState(false);
  const [left,setLeft]=useState(false);


  const BACKEND_URL =
		process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";



  // when the user click on delete room first it should make call to the backend and then to webSocket backend and then remove from the dom

  const leaveRoom = async (): Promise<"deleted" | "not_Deleted"> => {
    return new Promise((resolve, reject) => {
      try {
        setLoading(true);
        const foundUser = room.some((item) => item.roomId === roomId);

        // true when roomId is found so user not left the room
        // false when roomId is not found so user left the room so return deleted

        if (!foundUser) {
          return resolve("deleted");
        }


        const socketData = {
          type: "leave_room",
          roomId,
        };

        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(socketData));
          setLoading(false);
          if(room.length ===1){
            setCurrentRoomId("");
            setCurrentRoomName("");
          }
          setLeft(true);
          toast.success("Left room successfully");

          return resolve("deleted");
        } else {
          console.log("last done");
          setLoading(false);
          return resolve("not_Deleted");
        }

      } catch (error) {
        setLoading(false);
        const message = error instanceof Error ? error.message : "Unknown error";
        toast.error("Failed to leave room", { description: message });
        return reject(error);
      }
    });
  };

  // ! what if the user first leave room  then user press delete room

  const handleDelete = async () => {
    // it should send request to should send request to websocket backend to cut the connection and then make the request to the backend to remove the user from the database
    setLoading(true);
    try {
      const connection = await leaveRoom();

      if (connection === "not_Deleted") {
        throw new Error("not removed from the websocket backend");
      }
       await axios.delete( `${BACKEND_URL}/api/room/leaveroom`,
        { data: { roomId }, withCredentials: true },
      );

      setLoading(false);
      // remove from the room state
      deleteRoom(roomId);
      deleteMessage(roomId);
      toast.success("Left room successfully");
    } catch (error: unknown) {
      setLoading(false);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to leave room", { description: message });
    }
  };

  return (
    <div
      className={`flex mb-1 justify-between ${currentRoomId === roomId ? "bg-black/80" : "bg-black/40"} text-white rounded-md mx-1 p-1 hover:bg-black/80`}
      onClick={() => {
        setCurrentRoomId(roomId);
        setCurrentRoomName(roomName);
        setIsSidebarOpen(false);
      }}
    >
      <div className="pl-2">
        <h1 className="text-xl font-medium ">
          {roomName[0]?.toUpperCase()}
          {roomName.slice(1)}
        </h1>
      </div>
      <div className="space-y-1 space-x-2">
        <button

          onClick={(e) => {
            e.stopPropagation();
            leaveRoom();
          }}
          disabled={left}
          className="bg-blue-500 p-1 rounded-md"
        >
          {left ? "Left" : "Leave"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="bg-blue-400 p-1 rounded-md"
        >
          {loading ? <Spinner /> : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default RoomBlock;
