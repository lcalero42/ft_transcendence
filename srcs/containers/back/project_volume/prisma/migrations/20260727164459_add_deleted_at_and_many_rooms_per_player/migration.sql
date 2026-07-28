/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Player` table. All the data in the column will be lost.
  - Made the column `room_id` on table `Games` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Games" DROP CONSTRAINT "Games_room_id_fkey";

-- DropIndex
DROP INDEX "Rooms_created_by_key";

-- AlterTable
ALTER TABLE "Games" ALTER COLUMN "room_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Rooms" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Games" ADD CONSTRAINT "Games_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
