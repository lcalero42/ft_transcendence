/*
  Warnings:

  - You are about to drop the `User_test` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('waiting', 'playing', 'finished');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('civilian', 'undercover');

-- DropTable
DROP TABLE "User_test";

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rooms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "min_players" INTEGER NOT NULL DEFAULT 3,
    "max_players" INTEGER NOT NULL DEFAULT 6,
    "colyseus_room_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "Rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Games" (
    "id" SERIAL NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'waiting',
    "civilian_word" TEXT,
    "undecover_word" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "room_id" INTEGER NOT NULL,

    CONSTRAINT "Games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game_Players" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL,
    "eliminated_at" TIMESTAMP(3),
    "game_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,

    CONSTRAINT "Game_Players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word_Pair" (
    "id" SERIAL NOT NULL,
    "civilian_word" TEXT NOT NULL,
    "undercover_word" TEXT NOT NULL,

    CONSTRAINT "Word_Pair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- AddForeignKey
ALTER TABLE "Rooms" ADD CONSTRAINT "Rooms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Games" ADD CONSTRAINT "Games_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game_Players" ADD CONSTRAINT "Game_Players_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game_Players" ADD CONSTRAINT "Game_Players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
