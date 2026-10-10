import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { WordPairService } from './word_pair.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient } from '../generated/prisma/client';

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
      const result = { id: 5, ...catPair };
      prismaMock.word_Pair.create.mockResolvedValue(result);

      expect(await service.create(catPair)).toBe(result);
      expect(prismaMock.word_Pair.create).toHaveBeenCalledWith({
        data: catPair,
      });
    });
  });

  describe('findAll', () => {
    it('should return a word pair array', async () => {
      const result = [
        { id: 5, ...catPair },
        { id: 6, ...dogPair },
      ];
      prismaMock.word_Pair.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prismaMock.word_Pair.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a word pair', async () => {
      const result = { id: 5, ...catPair };
      prismaMock.word_Pair.findUnique.mockResolvedValue(result);

      expect(await service.findOne(5)).toBe(result);
      expect(prismaMock.word_Pair.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });

    it('should throw a NotFoundException when the word pair does not exist', async () => {
      prismaMock.word_Pair.findUnique.mockResolvedValue(null);

      await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a word pair and return it', async () => {
      const result = { id: 5, ...dogPair };
      prismaMock.word_Pair.update.mockResolvedValue(result);

      expect(await service.update(5, dogPair)).toBe(result);
      expect(prismaMock.word_Pair.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: dogPair,
      });
    });

    it('should forward undefined fields when the dto is partial', async () => {
      const updateDto = { civilianWord: 'dog' };
      const result = { id: 5, ...catPair, civilianWord: 'dog' };
      prismaMock.word_Pair.update.mockResolvedValue(result);

      expect(await service.update(5, updateDto)).toBe(result);
      expect(prismaMock.word_Pair.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          civilianWord: 'dog',
          undercoverWord: undefined,
          civilianWordFr: undefined,
          undercoverWordFr: undefined,
          civilianWordEs: undefined,
          undercoverWordEs: undefined,
        },
      });
    });
  });

  describe('remove', () => {
    // Word pairs are hard deleted, unlike players, rooms and games.
    it('should delete a word pair and return it', async () => {
      const result = { id: 5, ...catPair };
      prismaMock.word_Pair.delete.mockResolvedValue(result);

      expect(await service.remove(5)).toBe(result);
      expect(prismaMock.word_Pair.delete).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });
  });
});
