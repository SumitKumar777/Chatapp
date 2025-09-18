
import { createClient ,RedisClientType } from "redis";


const client:RedisClientType=createClient();

client.on("error",(err)=>{
   console.log("error in redis client",err)
})


async function connectClient(){
   if(!client.isOpen){
      await client.connect();
      console.log("client connected");
   }

}

export {client,connectClient};