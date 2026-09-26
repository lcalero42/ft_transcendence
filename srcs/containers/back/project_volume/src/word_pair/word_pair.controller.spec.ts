import { Test, TestingModule } from '@nestjs/testing';
import { WordPairController } from './word_pair.controller';
import { WordPairService } from './word_pair.service';
import { PrismaService } from '../prisma.service';

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
      const createDto = { civilianWord: 'cat', undercoverWord: 'tiger' };
      const result = { id: 5, civilianWord: 'cat', undercoverWord: 'tiger' };
      jest
        .spyOn(wordPairService, 'create')
        .mockImplementation(() => Promise.resolve(result));

      expect(await wordPairController.create(createDto)).toBe(result);
      expect(wordPairService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return a word pair array', async () => {
      const result = [
        { id: 5, civilianWord: 'cat', undercoverWord: 'tiger' },
        { id: 6, civilianWord: 'dog', undercoverWord: 'wolf' },
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
      const result = { id: 5, civilianWord: 'cat', undercoverWord: 'tiger' };
      jest
        .spyOn(wordPairService, 'findOne')
        .mockImplementation(() => Promise.resolve(result));

      expect(await wordPairController.findOne(5)).toBe(result);
      expect(wordPairService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('update', () => {
    it('should update a word pair and return it', async () => {
      const updateDto = { civilianWord: 'dog', undercoverWord: 'wolf' };
      const result = { id: 5, civilianWord: 'dog', undercoverWord: 'wolf' };
      jest
        .spyOn(wordPairService, 'update')
        .mockImplementation(() => Promise.resolve(result));

      expect(await wordPairController.update(5, updateDto)).toBe(result);
      expect(wordPairService.update).toHaveBeenCalledWith(5, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a word pair and return it', async () => {
      const result = { id: 5, civilianWord: 'cat', undercoverWord: 'tiger' };
      jest
        .spyOn(wordPairService, 'remove')
        .mockImplementation(() => Promise.resolve(result));

      expect(await wordPairController.remove(5)).toBe(result);
      expect(wordPairService.remove).toHaveBeenCalledWith(5);
    });
  });
});
