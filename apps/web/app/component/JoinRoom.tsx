"use client";



import { Dialog } from "radix-ui";
import { Users } from "lucide-react";
import SearchRoom from "./SearchRoom";
import useRoom from "../store/hooks/useRoom";

function JoinRoom() {
	 const joinRoomState = useRoom((state) => state.joinRoomState);
	const setJoinRoomState = useRoom((state) => state.setJoinRoomState);
	
		
	
	return (
		<>
			<Dialog.Root open={joinRoomState} onOpenChange={setJoinRoomState}>
				<Dialog.Trigger asChild>
					<button className="p-3 bg-black/40 text-white rounded-xl font-bold hover:bg-black/20 w-full " >
						{" "}
						<Users className="inline mr-2"/>
						Join
					</button>
				</Dialog.Trigger>

				<Dialog.Portal>
					<Dialog.Overlay className="DialogOverlay" />

					<Dialog.Content className="DialogContent">
						<Dialog.Title className=" text-2xl font-semibold">Join Room</Dialog.Title>

						<Dialog.Description
							id="create-dialog-description"
							className="DialogDescription text-xl font-medium"
						>
							Enter a name of room you want to join.
						</Dialog.Description>
						<SearchRoom />

						<Dialog.Close asChild>
							<button type="button" className="Button gray w-full mt-4">
								Cancel
							</button>
						</Dialog.Close>

						{/* Close "X" button in corner */}
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

export default JoinRoom;
