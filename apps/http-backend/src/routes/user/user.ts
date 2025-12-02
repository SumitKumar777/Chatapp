import express, { Request, Response } from "express";

import { authUser } from "../../middleware/middle.js";
import prisma from "@repo/db";
import getRedisClient from "../worker/redisClient.js";


export const userRouter: express.Router = express.Router();


const producerClient=await getRedisClient();

userRouter.get(
  "/getUserDetail",
  authUser,
  async (req: Request, res: Response) => {
    const userId = req.userId;

    try {

      let getCachedUserDetail;
      try {
        getCachedUserDetail = await producerClient.get(`userDetail:${userId}`);
      } catch (redisError) {
        console.log("Redis error:", redisError);
        getCachedUserDetail = null;
      }

      if (getCachedUserDetail) {
        return res.status(200).json({
          status: "success",
          message: "cached userDetail data",
          data: JSON.parse(getCachedUserDetail),
        });
      }

      const userDetail = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });



      const setcachedUserDetail = JSON.stringify(userDetail);

      try {
        await producerClient.set(`userDetail:${userId}`, setcachedUserDetail);
      } catch (redisError) {
        console.log("Redis set error:", redisError);
      }

      return res.status(200).json({
        status: "success",
        message: "db userDetail data",
        data: userDetail,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("error in the getuserdetail", error.message);
        return res.status(500).json({
          status: "error",
          message: "error while getting the userDetail",
          error: error.message,
        });
      } else {
        console.log("unexpected error in the geting the user detail", error);
        return res.status(500).json({
          status: "error",
          message: "uxpected error while getting the userDetail",
          error,
        });
      }
    }
  },
);

userRouter.delete("/deleteuser", authUser, async (req, res) => {
  try {
    const userId = req.userId;

    const deleteUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.status(204).json({ message: "user deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "failed to delete user", error: error.message });
  }
});
