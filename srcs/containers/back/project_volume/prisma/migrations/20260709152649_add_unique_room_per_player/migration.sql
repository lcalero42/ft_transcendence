/*
  Warnings:

  - A unique constraint covering the columns `[created_by]` on the table `Rooms` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rooms_created_by_key" ON "Rooms"("created_by");
