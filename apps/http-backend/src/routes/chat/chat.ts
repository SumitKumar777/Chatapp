import express, { Request, Response } from "express";
import { authUser } from "../../middleware/middle.js";
import { roomMessage } from "@repo/types";
import prisma from "@repo/db";
import getRedisClient from "../worker/redisClient.js";


export const chatRouter: express.Router = express.Router();


const producerClient=await getRedisClient();

type ChatMessage = {
   id: number,
   message: string,
   createdAt: Date,
   user: {
      username: string,
      id: string
   }
}





chatRouter.post("/message", authUser, async (req: Request, res: Response) => {
   try {
      const data = req.body;
      const parsed = roomMessage.safeParse(data);
      if (!parsed.success) {
         return res.status(400).json({ message: "invalid request body", error: parsed.error?.message })
      }
      const userId = req.userId;

      const { roomId, message } = parsed.data;

      await producerClient.lPush("message", JSON.stringify({ userId, roomId, message }));


      return res.status(200).json({ status: "success", message: "message sent to websocket" })

   } catch (error: unknown) {
      if (error instanceof Error) {
         console.log("error in sending message", error.message);
         return res.status(500).json({ status: "error", message: error.message })
      } else {
         console.log("error in sending message", error);
         return res.status(500).json({ status: "error", message: "unexpected error happend in sending message" })
      }
   }
})





chatRouter.get("/getRoomChats/:roomId", authUser, async (req: Request<{ roomId: string }>, res) => {

   try {
      const roomId = req.params.roomId;



      const cachedMessages = await producerClient.lRange(`roomChats:${roomId}`, 0, -1)


      if (cachedMessages.length > 0) {

         const messages = cachedMessages.map((item: string) => JSON.parse(item));


         return res.status(200).json({ status: "success", message: "all the cached data for this room", data: messages });


      }

     

      const chatMessages = await prisma.room.findUnique({
         where: {
            id: roomId
         },
         include: {
            chats: {
               select: {
                  id: true,
                  message: true,
                  createdAt: true,
                  user: {
                     select: {
                        username: true,
                        id: true
                     }
                  }
               }
            }
         }
      });

      if (!chatMessages) {
         return res.status(404).json({ status: "success", message: "no chatMessages for this room", data: chatMessages });
      }

      const formatedData: {
         userId: string, id: string, name: string,
         message: string,
         time: string
      }[] = [];




      chatMessages.chats.forEach((item: ChatMessage) => {
         formatedData.push({ userId: item.user.id, id: item.id.toString(), name: item.user.username, message: item.message, time: item.createdAt.toString() });
      })


      const redisChatData = formatedData.map((item: { userId: string, id: string, name: string, message: string, time: string }) => JSON.stringify(item));

      if (redisChatData.length >= 1) {
         await producerClient.rPush(`roomChats:${roomId}`, redisChatData)
      }
      return res.status(200).json({ status: "success", message: "all the chat for this room", data: formatedData });


   } catch (error) {

      console.log("error in the fetching chat for the room");
      return res.status(500).json({ status: "failed", message: "failed to get the chats for this room", error });
   }

})


