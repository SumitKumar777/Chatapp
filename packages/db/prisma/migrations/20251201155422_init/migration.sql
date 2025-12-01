-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_createdById_fkey";

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
