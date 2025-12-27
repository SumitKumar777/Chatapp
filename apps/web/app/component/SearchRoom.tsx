"use client";
import axios from "axios";
import { useRef } from "react";
import useRoom from "../store/hooks/useRoom";
import SearchRoomBlock from "./SearchRoomBlock";
import useSocket from "../store/hooks/useSocket";

function SearchRoom() {
	const timeOut = useRef<NodeJS.Timeout | null>(null);
	const roomDetail = useRoom((state) => state.roomDetail);
	const setRoomDetail = useRoom((state) => state.setRoomDetail);
	const setJoinRoomState = useRoom((state) => state.setJoinRoomState);

	const setRoom = useSocket((state) => state.setRoom);
	const socket = useSocket((state) => state.socket);
	const setCurrentRoomId = useSocket((state) => state.setCurrentRoomId);
	const setCurrentRoomName = useSocket((state) => state.setCurrentRoomName);

	const BACKEND_URL =
		process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

	const fetchRoomDetail = async (searchParam: string) => {
		if (!searchParam) {
			console.log("no SearchParam");
			setRoomDetail([]);
			return;
		}

		const fetchRoom = await axios.get(
			`${BACKEND_URL}/api/room/searchRoom/${searchParam}`,
			{ withCredentials: true }
		);
		setRoomDetail(fetchRoom.data.data);
	};

	const debouncedFetchRoom = (searchParam: string, delay: number) => {
		if (timeOut.current) {
			clearTimeout(timeOut.current);
		}

		timeOut.current = setTimeout(() => fetchRoomDetail(searchParam), delay);
	};

	const joinRoom = async (roomId: string) => {
		try {
			if (!roomId) {
				console.log("roomId is not present ");
				return;
			}


			const joinRoomResponse = await axios.post(
				`${BACKEND_URL}/api/room/joinroom`,
				{
					roomId,
				},
				{
					withCredentials: true,
				}
			);

			const roomData = {
				roomName: joinRoomResponse.data.data.room.name || " ",
				roomId: roomId as string,
			};
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket?.send(
					JSON.stringify({
						type: "join_room",
						roomId: roomId,
					})
				);
				setCurrentRoomId(roomId as string);
			
				setCurrentRoomName(joinRoomResponse.data.data.room.name);

				setRoom(roomData);
				setJoinRoomState(false);
				setRoomDetail([]);
			} else {
				console.log("Socket not ready yet, cannot join room");
			}

		} catch (error: unknown) {
			if (error instanceof Error) {
				console.log(error, "error in form of joining the room", error.message);
			} else {
				console.log(error, "unexpected error in form of joining the room");
			}
		}
	};

	return (
		<div className="space-y-4">
			<input
				type="text"
				placeholder="Search Room"
				className="border-2 w-full p-2 rounded-xl"
				onChange={(e) => debouncedFetchRoom(e.target.value, 500)}
			/>
			<div className="overflow-y-scroll h-60 scroll-smooth border-1 rounded-lg">
				{roomDetail.length > 0 ? (
					roomDetail.map((item) => (
						<SearchRoomBlock
							key={item.id}
							id={item.id}
							name={item.name}
							createdAt={item.createdAt}
							onClick={joinRoom}
						/>
					))
				) : (
					<p className="text-2xl flex items-center justify-center h-full">
						No Such Room
					</p>
				)}
			</div>
		</div>
	);
}

export default SearchRoom;
