import { Test, TestingModule } from '@nestjs/testing';
import { WordPairController } from './word_pair.controller';
import { WordPairService } from './word_pair.service';

describe('WordPairController', () => {
  let controller: WordPairController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordPairController],
      providers: [WordPairService],
    }).compile();

    controller = module.get<WordPairController>(WordPairController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
