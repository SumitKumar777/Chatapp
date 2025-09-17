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
interface UserSocket {
   userId: string,
   socket: WebSocket,
}



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


// store all the user when the add user message commes find that user from the allUser set and put that into the roomid because once the user connected only first time the user id we can have after that no user id we are able to access;



const allUser: Map<WebSocket,string> = new Map();

const mainState: Map<string, UserSocket[]> = new Map()

// AddUser to room 
const addUsertoRoom=(roomId:string,userSocket:WebSocket)=>{

   // find the user in alluser user and put that into mainState;
   const id=allUser.get(userSocket);
   if(!id){
      console.log("user not found in adding user");
      return;
   }
   // check for the first user 
   if(!mainState.has(roomId)){
      mainState.set(roomId,[{userId:id!,socket:userSocket}]);
      userSocket.send("user Connected");
      return ;
   }

   const roomUsers=mainState.get(roomId);

   const existinguser=roomUsers?.some(user=>user.userId===id);

   console.log("roomId outside adduser",roomId);
   if(!existinguser){
      console.log("roomId in the adduser websocket",roomId)
      roomUsers?.push({userId:id,socket:userSocket});
   }
   userSocket.send("user connected");

}

// Remove from room 
const removeUserfromRoom=(roomId:string,userSocket:WebSocket)=>{

   const id=allUser.get(userSocket);
   if(!id){
      console.log("no id in remove user from room");
      return ;
   }
   if(!mainState.has(roomId)){
      console.log("no such room in leave room ");
      return ;
   }

   const users=mainState.get(roomId);

   const updatedUser=users?.filter((user)=>user.userId!==id);

   if(updatedUser?.length===0){
      mainState.delete(roomId);
   }else{
      mainState.set(roomId,updatedUser!);
   }
   userSocket.send("user left the room ");
}

// Brodcast to roomMember

const brodcastMessage=(roomId:string,message:string,userSocket:WebSocket)=>{

   if(!roomId || !message|| !userSocket){
      console.log("function parameters are missing");
      return ;
   }

   console.log(roomId,message,"broadcast");


   const id=allUser.get(userSocket);
   if(!id){
      console.log("user id not found in broadcast message");
      return ;
   }
   const connectedUser=mainState.get(roomId)!;

   connectedUser.forEach((item) => console.log("userId", item.userId));

   if(!connectedUser){
      console.log("roomId not found in broadcast message");
      return ;
   }


   connectedUser.forEach((user)=>{
      try {
         if(user.userId!==id){
            user.socket.send(JSON.stringify({
               roomId,
               from: id,
               message
            }))
         }
      } catch (error) {
         console.log(`error sending to this user ${id} in room ${roomId}`);
      }
   })


}





wss.on("connection",((ws,request)=>{
   ws.on("error", (err) => console.log(err));

   const user:AuthUser=authUser(request.url as string);

   if(!user.success){
      ws.send("not authenticated");
      ws.close();
      return ;
   }
   allUser.set(ws, user.userId!);

   // Correct the types of data in this
   ws.on("message", (data:string) => {
      try {
         const parsedData:RequestBody=JSON.parse(data);
         console.log(parsedData,"parsedData in the websocket");
         const {type,roomId,message}=parsedData;

         if(type==="join_room"){
            addUsertoRoom(roomId,ws); 
         }
         if (type === "leave_room") {
           removeUserfromRoom(roomId,ws);
         }
         if (type === "message") {
            brodcastMessage(roomId, message!,ws);
         }


      } catch (error) {
         console.log(data.toString(), "data in the websocket");
         console.log(error,"error in the message")
      }
   })
   ws.send("hi from the server");
}))


