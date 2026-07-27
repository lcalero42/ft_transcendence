-- DropForeignKey
ALTER TABLE "Games" DROP CONSTRAINT "Games_room_id_fkey";

-- AlterTable
ALTER TABLE "Games" ALTER COLUMN "room_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Games" ADD CONSTRAINT "Games_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
