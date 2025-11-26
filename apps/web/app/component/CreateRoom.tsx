"use client";

import { useState } from "react";
import axios from "axios";
import useSocket from "../store/hooks/useSocket";
import { Dialog } from "radix-ui";
import { Plus } from "lucide-react";

function CreateRoom() {
  const [open, setOpen] = useState(false);
  const socket = useSocket((state) => state.socket);
  const setRoom = useSocket((state) => state.setRoom);
  const setCurrentRoomId = useSocket((state) => state.setCurrentRoomId);
  const setCurrentRoomName = useSocket((state) => state.setCurrentRoomName);

  const createRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    const formObj = e.currentTarget;
    try {
      e.preventDefault();
      const form = new FormData(e.currentTarget);

      const roomName = form.get("roomName");
      console.log(roomName, "roomName in the create rooomFrom");

      console.log(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, "backend");
      const createRoomResponse = await axios.post(
        process.env.NODE_ENV === "development"
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/createroom`
          : "/api/room/createroom",
        {
          roomName,
        },
        {
          withCredentials: true,
        },
      );

      if (!createRoomResponse || !createRoomResponse.data) {
        throw new Error("room not created in create room");
      }
      console.log("createroomResponse", createRoomResponse);
      const roomData = {
        roomName: createRoomResponse.data.data.name,
        roomId: createRoomResponse.data.data.id,
      };

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket?.send(
          JSON.stringify({
            type: "join_room",
            roomId: createRoomResponse.data.data.id,
          }),
        );
        setCurrentRoomId(createRoomResponse.data.data.id);
        setCurrentRoomName(createRoomResponse.data.data.name);

        setRoom(roomData);
        setOpen(false);
      } else {
        throw new Error(
          "error in create Room in sending create request to websocket server",
        );
      }

      formObj.reset();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error, "error in form of creating the room", error.message);
      } else {
        console.log(
          error,
          "unexpected error in form of creating the room",
          error,
        );
      }
      formObj.reset();
    }
  };

  return (
		<>
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Trigger asChild >
					<button className=" p-3 bg-black/40 text-white rounded-xl font-bold hover:bg-black/20 w-full ">
						<Plus className="inline mr-2" />
						Create Room
					</button>
				</Dialog.Trigger>

				<Dialog.Portal  >
					<Dialog.Overlay className="DialogOverlay" />

					<Dialog.Content className="DialogContent ">
						<Dialog.Title className="text-2xl font-semibold"> Create Room</Dialog.Title>

						<Dialog.Description
							id="create-dialog-description"
							className="DialogDescription font-medium"
						>
							Enter a name for your new room and click Create.
						</Dialog.Description>

						<form onSubmit={createRoom}>
							<fieldset className="Fieldset">
								<label className="text-xl mb-4" htmlFor="roomName" >
									Room Name
								</label>
								<input
									className="Input mt-2 outline-none"
									id="roomName"
									name="roomName"
									placeholder="Enter room name..."
									required
								/>
							</fieldset>

							<div className="flex gap-4 mt-6 justify-between">
								<Dialog.Close asChild>
									<button type="button" className="Button gray w-full">
										Cancel
									</button>
								</Dialog.Close>

								<button type="submit" className="Button green w-full">
									Create
								</button>
							</div>
						</form>

						<Dialog.Close asChild>
							<button
								className="IconButton absolute top-2 right-2"
								aria-label="Close"
							>
								✕
							</button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}

export default CreateRoom;
