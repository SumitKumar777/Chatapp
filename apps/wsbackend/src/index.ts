import { WebSocket, WebSocketServer } from "ws";
import url from "url";
import jwt, { JwtPayload } from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


if (!process.env.JWT_SECRET) {
  const dotenv = await import("dotenv");
  dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
}


if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}




const wss = new WebSocketServer({ port: 8080 });

interface RequestBody {
  type: string;
  roomId: string;
  message?: string;
}

interface State {
  userId: string;
  socket: WebSocket;
  rooms: string[];
}
interface UserSocket {
  userId: string;
  socket: WebSocket;
}

interface AuthUser {
  success: boolean;
  userId: string | null;
  username: string | null;
}

type UserInfo = {
  userId: string;
  username: string;
};

const authUser = (reqUrl: string): AuthUser => {
  const parsedUrl = url.parse(reqUrl, true);
  const queryParams = parsedUrl.query;


  if (queryParams.token) {
    const decode = jwt.verify(
      queryParams.token as string,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    return {
      success: true,
      userId: decode.id,
      username: decode.username,
    };
  } else {
    return {
      success: false,
      userId: null,
      username: null,
    };
  }
};

// store all the user when the add user message commes find that user from the allUser set and put that into the roomid because once the user connected only first time the user id we can have after that no user id we are able to access;

const allUser: Map<WebSocket, UserInfo> = new Map();

const mainState: Map<string, UserSocket[]> = new Map();


const addUsertoRoom = (roomId: string, userSocket: WebSocket) => {

  const user = allUser.get(userSocket);
  if (!user) {
    console.log("user not found in adding user");

    return;
  }
  // check for the first user
  if (!mainState.has(roomId)) {
    mainState.set(roomId, [{ userId: user.userId, socket: userSocket }]);

    userSocket.send("user Connected");
    return;
  }

  const roomUsers = mainState.get(roomId);
   
   const existinguser = roomUsers?.findIndex((u) => u.userId === user.userId) ;

  if (existinguser === -1) {
    roomUsers?.push({ userId: user.userId, socket: userSocket });
  } else if (roomUsers) {
    const existingUser = roomUsers.find(u => u.userId === user.userId);
    
    if (existingUser) {
        existingUser.socket = userSocket;
    } else {
      console.log("in the addUser to room  replacing sockets");
    }
  }

  userSocket.send("user connected");
};


const removeUserfromRoom = (roomId: string, userSocket: WebSocket) => {
  const user = allUser.get(userSocket);
  if (!user) {
    console.log("no id in remove user from room");
    return;
  }

  if (!mainState.has(roomId)) {
    console.log("no such room in leave room ");
    return;
  }

  const users = mainState.get(roomId);

  const updatedUser = users?.filter((u) => u.userId !== user.userId);

  updatedUser?.forEach((item) =>
    console.log("all the users connected after removing room", item.userId),
  );

  if (updatedUser?.length === 0) {
    mainState.delete(roomId);
  } else {
    mainState.set(roomId, updatedUser!);
  }
  userSocket.send("user left the room ");
};



const brodcastMessage = (
  roomId: string,
  message: string,
  userSocket: WebSocket,
) => {
  if (!roomId || !message || !userSocket) {
    console.log("function parameters are missing");
    return;
  }


  const user = allUser.get(userSocket);

  if (!user) {
    console.log("user id not found in broadcast message");
    return;
  }

  if (!mainState.has(roomId)) {
    console.log("room id not present", roomId);
  }

  const connectedUser = mainState.get(roomId)!;
  console.log(
    user.userId,
    "userid which is broadcasting the message in broadcast ",
  );

  connectedUser.forEach((item) =>
    console.log("all the connected user for that room", item.userId),
  );

  if (!connectedUser) {
    console.log("roomId not found in broadcast message");
    return;
  }

  const userPresent = connectedUser.some((item) => item.userId === user.userId);



  if (!userPresent) {
    console.log("user is not present", userPresent);
    return;
  }

  connectedUser.forEach((u) => {
    try {
      u.socket.send(
        JSON.stringify({
          roomId,
          userId: user.userId,
          name: user.username,
          time: new Date().toString(),
          message,
        }),
      );
    } catch (error) {
      console.log(
        `error sending to this user ${user.userId} in room ${roomId}`,
      );
    }
  });
};








wss.on("connection", (ws, request) => {
  ws.on("error", (err) => console.log(err));

  const user: AuthUser = authUser(request.url as string);

  if (!user.success || !user.userId || !user.username) {
    ws.send("not authenticated");
    ws.close();
    return;
  }
  allUser.set(ws, { userId: user.userId, username: user.username });
  
  ws.on("message", (data: string) => {
    try {
      const parsedData: RequestBody = JSON.parse(data);
      const { type, roomId, message } = parsedData;

      if (type === "join_room") {
        addUsertoRoom(roomId, ws);
      }
      if (type === "leave_room") {

        removeUserfromRoom(roomId, ws);
      }
      if (type === "message") {
        brodcastMessage(roomId, message!, ws);
      }
    } catch (error) {
      console.log(data.toString(), "data in the websocket");
      console.log(error, "error in the message");
    }
  });
  ws.send("hi from the server");
});
