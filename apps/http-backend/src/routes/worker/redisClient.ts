
import { createClient ,RedisClientType } from "redis";


const producerClient:RedisClientType=createClient();

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