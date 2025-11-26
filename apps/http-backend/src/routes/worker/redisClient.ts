
import { createClient ,RedisClientType } from "redis";

const PORT = 3001;


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