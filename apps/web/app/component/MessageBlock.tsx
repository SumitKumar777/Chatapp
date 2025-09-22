



type ChatMessage = {
	userId: string;
	name: string;
	message: string;
	time: string;
};

interface ChatMessageWithDetection extends ChatMessage{
   className:string
}


function MessageBlock({userId,name,message,time,className}:ChatMessageWithDetection) {

   return ( 
      <div className={`${className} border-1`}>
         <p>userId { userId}</p>
         <p>name{name}</p>
         <p>message {message}</p>
         <p>time {time}</p>
      </div>
    );
}

export default MessageBlock;