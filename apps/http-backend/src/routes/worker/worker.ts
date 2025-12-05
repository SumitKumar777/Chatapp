// for storing queries in database;
// if not stored in database then again store in queue;

import { createClient } from "redis";
import prisma from "@repo/db";
import getRedisClient from "./redisClient.js";

let producerClient: any = null;

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
client.on("error", (err) => console.log("error in worker client"));

const startWorker = async () => {
  try {
    producerClient = await getRedisClient();
    await client.connect();
    console.log("client connected in the startworker loop starting");
    while (true) {
      try {
        const msgRequest = await client.brPop("message", 0);
        if (msgRequest?.element) {
          const { userId, roomId, message } = JSON.parse(msgRequest?.element);

          const messageData = await prisma.chat.create({
            data: {
              userId,
              roomId,
              message,
            },
            include: {
              user: {
                select: {
                  username: true,
                },
              },
            },
          });

          const cachedMessage = JSON.stringify({
            userId,
            id: messageData.id.toString(),
            name: messageData.user.username,
            message,
            time: messageData.createdAt.toString(),
          });

          await producerClient.rPush(`roomChats:${roomId}`, cachedMessage);
        }
      } catch (error) {
        console.log("error in while loop of startworker", error);
      }
    }
  } catch (error) {
    console.log("error in the start worker", error);
  }
};

export { startWorker };
