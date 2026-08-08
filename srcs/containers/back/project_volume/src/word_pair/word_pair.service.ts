import { Injectable } from '@nestjs/common';
import { CreateWordPairDto } from './dto/create-word_pair.dto';
import { UpdateWordPairDto } from './dto/update-word_pair.dto';

@Injectable()
export class WordPairService {
  create(createWordPairDto: CreateWordPairDto) {
    return 'This action adds a new wordPair';
  }

  findAll() {
    return `This action returns all wordPair`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wordPair`;
  }

  update(id: number, updateWordPairDto: UpdateWordPairDto) {
    return `This action updates a #${id} wordPair`;
  }

  remove(id: number) {
    return `This action removes a #${id} wordPair`;
  }
}
