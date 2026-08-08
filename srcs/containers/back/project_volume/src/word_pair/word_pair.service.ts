import { Injectable } from '@nestjs/common';
import { CreateWordPairDto } from './dto/create-word_pair.dto';
import { UpdateWordPairDto } from './dto/update-word_pair.dto';
import { prisma } from '../../lib/prisma';

@Injectable()
export class WordPairService {
  async create(createWordPairDto: CreateWordPairDto) {
    const createWordPair = await prisma.word_Pair.create({
      data: {
        civilianWord: createWordPairDto.civilianWord,
        undercoverWord: createWordPairDto.undercoverWord,
      },
    });
    return createWordPair;
  }

  async findAll() {
    const wordPairs = await prisma.word_Pair.findMany();
    return wordPairs;
  }

  async findOne(id: number) {
    const wordPair = await prisma.word_Pair.findUnique({
      where: { id: id },
    });
    return wordPair;
  }

  async update(id: number, updateWordPairDto: UpdateWordPairDto) {
    const updtateWordPlayer = await prisma.word_Pair.update({
      where: { id: id },
      data: {
        civilianWord: updateWordPairDto.civilianWord,
        undercoverWord: updateWordPairDto.undercoverWord,
      },
    });
    return updtateWordPlayer;
  }

  async remove(id: number) {
    const rmWordPair = await prisma.word_Pair.delete({ where: { id: id } });
    return rmWordPair;
  }
}
