import { UserData } from "../store/hooks/useSocket";


function MessageBlock({roomId,from,message}:UserData) {
   return ( 
      <div>
         <h1>{roomId}</h1>
         <p>{from}</p>
         <p>{message}</p>
      </div>
    );
}

export default MessageBlock;