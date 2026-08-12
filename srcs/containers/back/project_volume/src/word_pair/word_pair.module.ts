import { Module } from '@nestjs/common';
import { WordPairService } from './word_pair.service';
import { WordPairController } from './word_pair.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WordPairController],
  providers: [PrismaService, WordPairService],
})
export class WordPairModule {}
