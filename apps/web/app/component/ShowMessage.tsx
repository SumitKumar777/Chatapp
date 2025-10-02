"use client";

import { useEffect, useRef } from "react";
import useSocket from "../store/hooks/useSocket";

import axios from "axios";
import allMessage from "../store/hooks/allMessage";
import userDetail from "../store/hooks/userDetails";
import SentMessage from "./SentMessage";
import ReceivedMessage from "./ReceivedMessage";

type ChatMessage = {
  userId: string;
  id: string;
  name: string;
  message: string;
  time: string;
};

// when we type in the input field the state rerender that many times fix that when the user click send only that time state should rerender;

function ShowMessage() {
  const messageByRoom = allMessage((state) => state.messageByRoom);
  const currentRoomId = useSocket((state) => state.currentRoomId);
  const userId = userDetail((state) => state.userId);
  const setMessage = allMessage((state) => state.setMessage);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessage = async (roomId: string) => {
      const messages = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/getRoomChats/${roomId}`,
        {
          withCredentials: true,
        },
      );
      console.log("messages in the setting the messages", messages.data.data);
      setMessage(currentRoomId!, messages.data.data);
    };

    if (currentRoomId) {
      fetchMessage(currentRoomId);
    }
  }, [currentRoomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageByRoom]);

  return (
    <div className="relative w-full">
      <div className="scroll-smooth" ref={scrollRef}>
        <div className="text-white py-1 px-6 ">
          {(messageByRoom[currentRoomId ?? ""] ?? []).length > 0
            ? (messageByRoom[currentRoomId ?? ""] ?? []).map(
                (item: ChatMessage) =>
                  item.userId === userId ? (
                    <SentMessage
                      key={item.id}
                      name={item.name}
                      time={item.time}
                      message={item.message}
                    />
                  ) : (
                    <ReceivedMessage
                      key={item.id}
                      name={item.name}
                      time={item.time}
                      message={item.message}
                    />
                  ),
              )
            : "NO Messages for this room"}
        </div>
      </div>
    </div>
  );
}

export default ShowMessage;
