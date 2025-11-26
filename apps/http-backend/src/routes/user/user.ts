import express,{ Request, Response } from "express";

import { authUser } from "../../middleware/middle.js";
import prisma from "@repo/db";
import { producerClient } from "../worker/redisClient.js";

export const userRouter:express.Router=express.Router();
   

userRouter.get("/getUserDetail",authUser,async (req:Request,res:Response)=>{

   const userId=req.userId;

   try {

      const getCachedUserDetail=await producerClient.get(`userDetail:${userId}`);

      if(getCachedUserDetail){
         return res.status(200).json({status:"success",message:"cached userDetail data",data:JSON.parse(getCachedUserDetail)});
      }

      const userDetail=await prisma.user.findUnique({
         where:{
            id:userId
         }
      })

      const setcachedUserDetail=JSON.stringify(userDetail);

      await producerClient.set(`userDetail:${userId}`, setcachedUserDetail);


      return res.status(200).json({ status: "success", message: "db userDetail data", data: userDetail });

   } catch (error:unknown) {

      if(error instanceof Error ){

         console.log("error in the getuserdetail",error.message);
         return res.status(500).json({status:"error",message:"error while getting the userDetail",error:error.message})
      }else{
         console.log("unexpected error in the geting the user detail",error);
         return res.status(500).json({ status: "error", message: "uxpected error while getting the userDetail", error })

      }

   }

})
