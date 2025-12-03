import express, { Request, Response } from "express";

import prisma, { Prisma } from "@repo/db";

import { createRoomSchema, joinRoom, roomMessage } from "@repo/types";
import { authUser } from "../../middleware/middle.js";
import getRedisClient from "../worker/redisClient.js";
const producerClient=await getRedisClient();

export const roomRouter: express.Router = express.Router();

type RoomData = { room: { name: string }; roomId: string };

roomRouter.post(
  "/createroom",
  authUser,
  async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const parsed = createRoomSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid createRoom body",
          error: parsed.error?.message,
        });
      }

      const userId = req.userId;

      const roomCreated = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const room = await tx.room.create({
            data: {
              name: parsed.data?.roomName as string,
              createdById: userId as string,
            },
          });
          const roomMem = await tx.roomMember.create({
            data: {
              roomId: room.id,
              role: "admin",
              userId: userId as string,
            },
          });
          return room;
        },
      );

      await producerClient.del(`roomList:${userId}`);

      return res.status(200).json({
        status: "success",
        message: "room created successfully",
        data: roomCreated,
      });
    } catch (error: any) {
      console.log("error in room creating", error);
      return res.status(500).json({
        status: "failed",
        message: "room not created ",
        error: error.message,
      });
    }
  },
);

interface RoomParams {
  roomId: string;
}

roomRouter.get(
  "/detail",
  authUser,
  async (req: Request, res) => {
    try {
      const roomId: string = req.query.roomId as string;

      if (!roomId) {
        return res.status(400).json({
          message: "roomId is not present in roomDetails  request api",
        });
      }

      const roomDetail = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
      });

      if (!roomDetail) {
        return res
          .status(404)
          .json({ status: "error", message: "room not found" });
      }

      return res.status(200).json({
        status: "success",
        message: "room details fetched",
        data: roomDetail,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("error in the roomDetails", error.message);
        return res
          .status(500)
          .json({ status: "error", message: error.message });
      } else {
        console.log("unexpected error in the room details", error);
        return res.status(500).json({
          status: "error",
          message: "unexpected error in the roomdetails",
        });
      }
    }
  },
);

// invalidate Roomlist cache if the user has joined the room

roomRouter.post(
  "/joinroom",
  authUser,
  async (req: Request<RoomParams>, res: Response) => {
    try {
      const body = req.body;
      const parsed = joinRoom.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({
          status: "error",
          message: "invalid join room request body",
          error: parsed.error?.message,
        });
      }
      const userId = req.userId;

      // Check if room exists
      const roomExists = await prisma.room.findUnique({
        where: { id: parsed.data.roomId },
      });
      if (!roomExists) {
        return res
          .status(400)
          .json({ status: "error", message: "room does not exist" });
      }

      // Check if the user is already in the room

      const foundUser = await prisma.roomMember.findFirst({
        where: {
          roomId: parsed.data.roomId as string,
          userId: userId as string,
        },
        include: {
          room: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!foundUser) {
        const joinUser = await prisma.roomMember.create({
          data: {
            roomId: parsed.data.roomId,
            userId: userId as string,
          },
          include: {
            room: {
              select: {
                name: true,
              },
            },
          },
        });

        // for cache invalidation after a new room is added

        await producerClient.del(`roomList:${userId}`);
        return res.status(200).json({
          status: "success",
          message: "user  added to room",
          data: joinUser,
        });
      }
      return res.status(200).json({
        status: "success",
        message: "user added to room",
        data: foundUser,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("error in the joining room", error.message);
        return res
          .status(500)
          .json({ status: "error", message: error.message });
      } else {
        console.log("unexpected error in the joinRoom ", error);
        return res.status(500).json({
          status: "error",
          message: "unexpected error in the joinRoom",
          error,
        });
      }
    }
  },
);

// getRooms all the rooms where the user is not joined/created / not part of with and search based on name

roomRouter.get(
  "/searchRoom/:searchRoomName",
  authUser,
  async (req: Request, res: Response) => {
    const userId = req.userId;
    const roomName = req.params.searchRoomName;

    if (!roomName) {
      throw new Error("invalid params roomname is not present");
    }

    try {
       const searchedRoom = await prisma.room.findMany({
          where: {
             name: {
                startsWith: roomName,
                mode: "insensitive",
             },
             members: {
                none: {
                   userId: userId,
                },
             },
          },
          select: {
             id: true,
             name: true,
             createdAt: true,
          },
       });


      if (!searchedRoom) {
        return res
          .status(200)
          .json({ status: "success", message: "no room found", data: [] });
      }

      res.status(200).json({
        status: "success",
        message: "room searched data",
        data: searchedRoom,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log("error in the getting the searched  room", error.message);
        return res
          .status(500)
          .json({ status: "error", message: error.message });
      } else {
        console.log("unexpected error in the searched room ", error);
        return res.status(500).json({
          status: "error",
          message: "unexpected error in the searched room",
          error,
        });
      }
    }
  },
);

// invalidate Roomlist cache if the user has left the room

// when the user has left the room the message should remain cached of that roomId for that userId because it should never change

roomRouter.delete(
  "/leaveroom",
  authUser,
  async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const parsed = joinRoom.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({
          status: "error",
          message: "invalid leave room request body",
          error: parsed.error?.message,
        });
      }

      const userId = req.userId;

      const deletedMember = await prisma.roomMember.deleteMany({
        where: {
          roomId: parsed.data.roomId,
          userId: userId,
        },
      });

      // remove that room from the roomLists for that user and and put the newlist to that redis queue

      if (deletedMember.count === 0) {
        return res
          .status(404)
          .json({ status: "error", message: "no such room " });
      }

      await producerClient.del(`roomList:${userId}`);

      return res
        .status(200)
        .json({ status: "success", message: "Left room successfully" });
    } catch (error) {
      if (error instanceof Error) {
        console.log("error in the leaving room", error.message);
        return res
          .status(500)
          .json({ status: "error", message: error.message });
      } else {
        console.log("unexpected error in the joinRoom ", error);
        return res.status(500).json({
          status: "error",
          message: "unexpected error in the leaving room",
        });
      }
    }
  },
);

// Fetch all the Rooms that the user joined in

// cache all the rooms for that userId if no room is created or joined for that userID if joined or created invalidate it

roomRouter.get("/getAllRooms", authUser, async (req, res) => {
  try {
    const userId = req.userId;

    const cachedRoomList = await producerClient.lRange(
      `roomList:${userId}`,
      0,
      -1,
    );

    if (cachedRoomList.length > 0) {
      const roomLists = cachedRoomList.map((item: string) => JSON.parse(item));
      return res.status(200).json({
        status: "success",
        message: "feched all the rooms list cached data",
        data: roomLists,
      });
    }

    const allRooms: RoomData[] = await prisma.roomMember.findMany({
      where: {
        userId: userId,
      },
      select: {
        roomId: true,
        room: {
          select: {
            name: true,
          },
        },
      },
    });

    const formatedData: { roomName: string; roomId: string }[] = [];

    allRooms.forEach((item: RoomData) => {
      formatedData.push({ roomName: item.room.name, roomId: item.roomId });
    });

    const setCachedRoomList = formatedData.map(
      (item: { roomName: string; roomId: string }) => JSON.stringify(item),
    );

    if (formatedData.length > 0) {
      await producerClient.rPush(`roomList:${userId}`, setCachedRoomList);
    }

    return res.status(200).json({
      status: "success",
      message: "feched all the rooms list not cached",
      data: formatedData,
    });
  } catch (error) {
    console.log("error in getAll rooms", error);
    return res.status(500).json({
      status: "failed",
      message: "error in fetching all the rooms",
      error,
    });
  }
});
