import {WebSocket, WebSocketServer } from "ws";
import url from "url";

import jwt, { JwtPayload } from "jsonwebtoken";
import {JWT_SECRET} from "@repo/types"

const wss=new WebSocketServer({port:8080});

interface RequestBody{
   type:string,
   roomId:string,
   message?:string
}

interface State{
   userId:string,
   socket:WebSocket,
   rooms:string[]
}
const state:State[]=[];


interface AuthUser{
   success:boolean,
   userId:string |null
}

const authUser=(reqUrl:string):AuthUser =>{
   console.log(reqUrl,"reqUrl in the function ")
   const parsedUrl= url.parse(reqUrl,true);
   const queryParams=parsedUrl.query;

   if(queryParams.token){
      const decode=jwt.verify(queryParams.token as string,JWT_SECRET) as JwtPayload
      return {
         success:true,
         userId:decode.id
      }
   }else{
      return {
         success:false,
         userId:null
      };
   }
}

wss.on("connection",((ws,request)=>{
   ws.on("error", (err) => console.log(err));

   const user:AuthUser=authUser(request.url as string);

   if(!user.success){
      ws.send("not authenticated");
      ws.close();
      return ;
   }
   
   const userObj={
      userId:user.userId  ?? "",
      socket:ws,
      rooms:[]
   }
   state.push(userObj);

   ws.on("message", (data) => {
      try {
         const parsedData:RequestBody=JSON.parse(data.toString());
         console.log(parsedData,"parsedData in the websocket");

         if(parsedData.type==="join_room"){
            const user:State=state.find((u)=>u.socket===ws)!;
            user.rooms.push(parsedData.roomId);
            console.log("user in join room",user);

         }
         if (parsedData.type === "leave_room") {
            const user: State = state.find((u) => u.socket === ws)!;

            user.rooms = user.rooms.filter((room) => room !== parsedData.roomId);

            console.log("user in leave room" );
         }


         if (parsedData.type === "message") { 
            const user: State = state.find((u) => u.socket === ws)!;
            const restMember=state.filter((u)=>u.socket!=user.socket);
            restMember.map((m)=>{
               m.socket.send(JSON.stringify(parsedData.message));
            })

            console.log("user in message room", restMember);

         }


      } catch (error) {
         console.log(error,"error in the message")
      }
   })
   ws.send("hi from the server");
}))


