-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "discord_id" TEXT,
ADD COLUMN     "google_id" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Player_google_id_key" ON "Player"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "Player_discord_id_key" ON "Player"("discord_id");
