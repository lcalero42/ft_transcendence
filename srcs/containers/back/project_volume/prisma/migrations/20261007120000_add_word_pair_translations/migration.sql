-- AlterTable
ALTER TABLE "Word_Pair" ADD COLUMN     "civilian_word_fr" TEXT,
ADD COLUMN     "undercover_word_fr" TEXT,
ADD COLUMN     "civilian_word_es" TEXT,
ADD COLUMN     "undercover_word_es" TEXT;

UPDATE "Word_Pair" SET
    "civilian_word_fr" = "civilian_word",
    "undercover_word_fr" = "undercover_word",
    "civilian_word_es" = "civilian_word",
    "undercover_word_es" = "undercover_word";

ALTER TABLE "Word_Pair" ALTER COLUMN "civilian_word_fr" SET NOT NULL,
ALTER COLUMN "undercover_word_fr" SET NOT NULL,
ALTER COLUMN "civilian_word_es" SET NOT NULL,
ALTER COLUMN "undercover_word_es" SET NOT NULL;
