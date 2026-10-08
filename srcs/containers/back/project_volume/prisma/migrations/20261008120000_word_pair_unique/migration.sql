DELETE FROM "Word_Pair" a
USING "Word_Pair" b
WHERE a."civilian_word" = b."civilian_word"
  AND a."undercover_word" = b."undercover_word"
  AND a."id" > b."id";

CREATE UNIQUE INDEX "Word_Pair_civilian_word_undercover_word_key" ON "Word_Pair"("civilian_word", "undercover_word");
