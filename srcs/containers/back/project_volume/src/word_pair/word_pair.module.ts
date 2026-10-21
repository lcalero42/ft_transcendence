import { Module } from '@nestjs/common';
import { WordPairService } from './word_pair.service';
import { WordPairController } from './word_pair.controller';

@Module({
  controllers: [WordPairController],
  providers: [WordPairService],
})
export class WordPairModule {}
