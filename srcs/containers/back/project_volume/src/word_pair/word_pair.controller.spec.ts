import { Test, TestingModule } from '@nestjs/testing';
import { WordPairController } from './word_pair.controller';
import { WordPairService } from './word_pair.service';
import { PrismaService } from '../prisma.service';

const catPair = {
  civilianWord: 'cat',
  undercoverWord: 'tiger',
  civilianWordFr: 'chat',
  undercoverWordFr: 'tigre',
  civilianWordEs: 'gato',
  undercoverWordEs: 'tigre',
};

const dogPair = {
  civilianWord: 'dog',
  undercoverWord: 'wolf',
  civilianWordFr: 'chien',
  undercoverWordFr: 'loup',
  civilianWordEs: 'perro',
  undercoverWordEs: 'lobo',
};

describe('WordPairController', () => {
  let wordPairController: WordPairController;
  let wordPairService: WordPairService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordPairController],
      providers: [WordPairService, { provide: PrismaService, useValue: {} }],
    }).compile();

    wordPairController = module.get<WordPairController>(WordPairController);
    wordPairService = module.get<WordPairService>(WordPairService);
  });

  it('wordPairController should be defined', () => {
    expect(wordPairController).toBeDefined();
  });

  it('wordPairService should be defined', () => {
    expect(wordPairService).toBeDefined();
  });

  describe('create', () => {
    it('should create a word pair', async () => {
      const result = { id: 5, ...catPair };
      jest
        .spyOn(wordPairService, 'create')
        .mockImplementation(() => Promise.resolve(result));

      expect(await wordPairController.create(catPair)).toBe(result);
      expect(wordPairService.create).toHaveBeenCalledWith(catPair);
    });
  });

  describe('findAll', () => {
    it('should return a word pair array', async () => {
      const result = [
        { id: 5, ...catPair },
        { id: 6, ...dogPair },
      ];
      jest
        .spyOn(wordPairService, 'findAll')
        .mockImplementation(() => Promise.resolve(result));

      expect(await wordPairController.findAll()).toBe(result);
      expect(wordPairService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a word pair', async () => {
      const result = { id: 5, ...catPair };
      jest
        .spyOn(wordPairService, 'findOne')
        .mockImplementation(() => Promise.resolve(result));

      expect(await wordPairController.findOne(5)).toBe(result);
      expect(wordPairService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('update', () => {
    it('should update a word pair and return it', async () => {
      const result = { id: 5, ...dogPair };
      jest
        .spyOn(wordPairService, 'update')
        .mockImplementation(() => Promise.resolve(result));

      expect(await wordPairController.update(5, dogPair)).toBe(result);
      expect(wordPairService.update).toHaveBeenCalledWith(5, dogPair);
    });
  });

  describe('remove', () => {
    it('should delete a word pair and return it', async () => {
      const result = { id: 5, ...catPair };
      jest
        .spyOn(wordPairService, 'remove')
        .mockImplementation(() => Promise.resolve(result));

      expect(await wordPairController.remove(5)).toBe(result);
      expect(wordPairService.remove).toHaveBeenCalledWith(5);
    });
  });
});
