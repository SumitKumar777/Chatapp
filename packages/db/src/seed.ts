import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"

const prisma= new PrismaClient();


async function main(){
   
   await prisma.$transaction(async (tx)=>{

      const firstUser = await tx.user.upsert({
         where:{email:"e2euser@example.com"},
         update:{},
         create:{
            username:"e2euser",
            email:"e2euser@example.com",
            password: await bcrypt.hash("e2epassword", 10)}});

      const secondUser = await tx.user.upsert({
         where: { email: "e2euser2@example.com" },
         update: {},
         create: {
            username: "e2euser2",
            email: "e2euser2@example.com",
            password: await bcrypt.hash("e2epassword2", 10)
         }
      });

      const createRoom = await tx.room.upsert({
         where: { name: "endtoendroom" },
         update: {},
         create: {
            name: "endtoendroom",
            createdById: firstUser.id
         }
      })

      await tx.roomMember.upsert({
         where: {
            roomId_userId: {
               roomId: createRoom.id,
               userId: firstUser.id
            }
         },
         update: {},
         create: {
            roomId: createRoom.id,
            userId: firstUser.id
         }
      })

      await tx.roomMember.upsert({
         where: {
            roomId_userId: {
               roomId: createRoom.id,
               userId: secondUser.id
            }
         },
         update: {},
         create: {
            roomId: createRoom.id,
            userId: secondUser.id
         }
      })
      


   })

   console.log("seeding successully completed")
}


main().catch((err)=>console.log("error in seeding database",err.message)).finally(()=>prisma.$disconnect());