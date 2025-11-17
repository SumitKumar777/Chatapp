
import { createClient ,RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config();

const producerClient: RedisClientType = createClient({ url: process.env.REDIS_URL || "redis://redis:6379" });
producerClient.on("error",(err)=>{
   console.log("error in redis producerClient",err)
})


async function connectClient(){
   if(!producerClient.isOpen){
      await producerClient.connect();
      console.log("client connected");
   }

}

export {producerClient,connectClient};