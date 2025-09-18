// for storing queries in database;
// if not stored in database then again store in queue;

import { createClient } from "redis";
import prisma from "../../../../../packages/db/dist/index.js";

const client=createClient();
client.on("error",(err)=>console.log("error in worker client"));



const startWorker=async ()=>{
   try {
      await client.connect()
      console.log("client connected in the startworker loop starting");
      while (true) {
         try {
            const msgRequest =await client.brPop("chatMessage", 0);
            console.log(msgRequest?.element, " data in startWorker");
            if(msgRequest?.element){
               const { userId, roomId, message } = JSON.parse(msgRequest?.element);

               await prisma.chat.create({
                  data:{
                     userId,
                     roomId,
                     message
                  }
               })
            }
            

         } catch (error) {
            console.log("error in while loop of startworker", error)
         }
      }
   } catch (error) {
      console.log("error in the start worker",error);
   }

}

startWorker()