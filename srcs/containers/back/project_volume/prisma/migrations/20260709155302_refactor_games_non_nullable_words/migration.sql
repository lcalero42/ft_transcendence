/*
  Warnings:

  - You are about to drop the column `undecover_word` on the `Games` table. All the data in the column will be lost.
  - Added the required column `undercover_word` to the `Games` table without a default value. This is not possible if the table is not empty.
  - Made the column `civilian_word` on table `Games` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Games" DROP COLUMN "undecover_word",
ADD COLUMN     "undercover_word" TEXT NOT NULL,
ALTER COLUMN "civilian_word" SET NOT NULL;
