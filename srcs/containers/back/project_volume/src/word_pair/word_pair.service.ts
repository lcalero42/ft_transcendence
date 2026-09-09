import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWordPairDto } from './dto/create-word_pair.dto';
import { UpdateWordPairDto } from './dto/update-word_pair.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WordPairService {
  constructor(private prisma: PrismaService) {}

  async create(createWordPairDto: CreateWordPairDto) {
    const createWordPair = await this.prisma.word_Pair.create({
      data: {
        civilianWord: createWordPairDto.civilianWord,
        undercoverWord: createWordPairDto.undercoverWord,
      },
    });
    return createWordPair;
  }

  async findAll() {
    const wordPairs = await this.prisma.word_Pair.findMany();
    return wordPairs;
  }

  async findOne(id: number) {
    const wordPair = await this.prisma.word_Pair.findUnique({
      where: { id: id },
    });
    if (!wordPair)
      throw new NotFoundException('Word pair does not exist');
    return wordPair;
  }

  async update(id: number, updateWordPairDto: UpdateWordPairDto) {
    const updateWordPair = await this.prisma.word_Pair.update({
      where: { id: id },
      data: {
        civilianWord: updateWordPairDto.civilianWord,
        undercoverWord: updateWordPairDto.undercoverWord,
      },
    });
    return updateWordPair;
  }

  async remove(id: number) {
    const rmWordPair = await this.prisma.word_Pair.delete({
      where: { id: id },
    });
    return rmWordPair;
  }
}
