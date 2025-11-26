
import {  connectClient } from "./routes/worker/redisClient.js";
import  { startWorker } from "./routes/worker/worker.js";
import { app } from "./index.js";


const PORT = 3001;
async function startServer() {

   try {
      await connectClient();
      startWorker();

      app.listen(PORT, () => console.log(`app is listening on port ${PORT}`))
   } catch (error) {
      console.log("error in connecting starting the server", error)
   }
}

startServer();