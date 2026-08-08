import { Test, TestingModule } from '@nestjs/testing';
import { WordPairService } from './word_pair.service';

describe('WordPairService', () => {
  let service: WordPairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WordPairService],
    }).compile();

    service = module.get<WordPairService>(WordPairService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
