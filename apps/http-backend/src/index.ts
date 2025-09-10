import express ,{ Express } from "express";

const app:Express=express();
const PORT=3001;


app.use(express.json());


app.get("/",(req,res)=>{
   
   res.json({message:"request received"}).status(200);
})

app.listen(PORT, () => console.log(`the app is listening on port ${PORT}`))