import type { Word_Pair } from '../generated/prisma/client';

export const WORD_PAIRS: Omit<Word_Pair, 'id'>[] = [
  {
    civilianWord: 'rabbit',
    undercoverWord: 'horse',
    civilianWordFr: 'lapin',
    undercoverWordFr: 'cheval',
    civilianWordEs: 'conejo',
    undercoverWordEs: 'caballo',
  },
  {
    civilianWord: 'cat',
    undercoverWord: 'tiger',
    civilianWordFr: 'chat',
    undercoverWordFr: 'tigre',
    civilianWordEs: 'gato',
    undercoverWordEs: 'tigre',
  },
  {
    civilianWord: 'phone',
    undercoverWord: 'computer',
    civilianWordFr: 'téléphone',
    undercoverWordFr: 'ordinateur',
    civilianWordEs: 'teléfono',
    undercoverWordEs: 'ordenador',
  },
];
