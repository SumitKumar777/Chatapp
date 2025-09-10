import { WebSocketServer } from "ws";



const wss=new WebSocketServer({port:8080});



wss.on("connection",((ws=>{
   ws.on("error",(err)=>console.log(err));

   ws.on("message",(data)=>{
      console.log("message received",data.toString());
      wss.clients.forEach((client)=>{
         if(client.readyState===WebSocket.OPEN && client!=ws){
            client.send(data.toString());
         }
      })
   })
   ws.send("hi from the server");
})))


