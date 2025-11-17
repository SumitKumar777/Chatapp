
import { createClient ,RedisClientType } from "redis";


if (!process.env.REDIS_URL) {
   const dotenv = await import("dotenv");
   dotenv.config();
}

const producerClient: RedisClientType = createClient({
   url: process.env.REDIS_URL || "redis://localhost:6379"
});

async function connectClient(){
   if(!producerClient.isOpen){
      await producerClient.connect();
      console.log("client connected");
   }

}

export {producerClient,connectClient};