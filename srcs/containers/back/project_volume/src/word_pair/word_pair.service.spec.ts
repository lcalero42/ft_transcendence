import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { WordPairService } from './word_pair.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient } from '../generated/prisma/client';

describe('WordPairService', () => {
  let service: WordPairService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordPairService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<WordPairService>(WordPairService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a word pair', async () => {
      const createDto = { civilianWord: 'cat', undercoverWord: 'tiger' };
      const result = { id: 5, civilianWord: 'cat', undercoverWord: 'tiger' };
      prismaMock.word_Pair.create.mockResolvedValue(result);

      expect(await service.create(createDto)).toBe(result);
      expect(prismaMock.word_Pair.create).toHaveBeenCalledWith({
        data: {
          civilianWord: createDto.civilianWord,
          undercoverWord: createDto.undercoverWord,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return a word pair array', async () => {
      const result = [
        { id: 5, civilianWord: 'cat', undercoverWord: 'tiger' },
        { id: 6, civilianWord: 'dog', undercoverWord: 'wolf' },
      ];
      prismaMock.word_Pair.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prismaMock.word_Pair.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a word pair', async () => {
      const result = { id: 5, civilianWord: 'cat', undercoverWord: 'tiger' };
      prismaMock.word_Pair.findUnique.mockResolvedValue(result);

      expect(await service.findOne(5)).toBe(result);
      expect(prismaMock.word_Pair.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });

    it('should return null when the word pair does not exist', async () => {
      prismaMock.word_Pair.findUnique.mockResolvedValue(null);

      expect(await service.findOne(404)).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a word pair and return it', async () => {
      const updateDto = { civilianWord: 'dog', undercoverWord: 'wolf' };
      const result = { id: 5, civilianWord: 'dog', undercoverWord: 'wolf' };
      prismaMock.word_Pair.update.mockResolvedValue(result);

      expect(await service.update(5, updateDto)).toBe(result);
      expect(prismaMock.word_Pair.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          civilianWord: updateDto.civilianWord,
          undercoverWord: updateDto.undercoverWord,
        },
      });
    });

    it('should forward undefined fields when the dto is partial', async () => {
      const updateDto = { civilianWord: 'dog' };
      const result = { id: 5, civilianWord: 'dog', undercoverWord: 'tiger' };
      prismaMock.word_Pair.update.mockResolvedValue(result);

      expect(await service.update(5, updateDto)).toBe(result);
      expect(prismaMock.word_Pair.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { civilianWord: 'dog', undercoverWord: undefined },
      });
    });
  });

  describe('remove', () => {
    // Word pairs are hard deleted, unlike players, rooms and games.
    it('should delete a word pair and return it', async () => {
      const result = { id: 5, civilianWord: 'cat', undercoverWord: 'tiger' };
      prismaMock.word_Pair.delete.mockResolvedValue(result);

      expect(await service.remove(5)).toBe(result);
      expect(prismaMock.word_Pair.delete).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });
  });
});
