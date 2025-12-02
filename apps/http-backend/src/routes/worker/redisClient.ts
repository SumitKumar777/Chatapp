
import { createClient ,RedisClientType } from "redis";


let client:RedisClientType|null=null;


export default async function getRedisClient() {

   if(client && client.isOpen){
      return client;
   }

   client= createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
   })

   client.on("error",(error)=>{
      console.log("error on client",error)
   })


   await client.connect();
   return client;

}

