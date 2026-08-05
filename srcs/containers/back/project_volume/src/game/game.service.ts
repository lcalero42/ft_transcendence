import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { prisma } from '../../lib/prisma';

@Injectable()
export class GameService {
  async create(createGameDto: CreateGameDto) {
    const createGame = await prisma.games.create({
      data: {
        civilianWord: createGameDto.civilianWord,
        undercoverWord: createGameDto.undercoverWord,
        roomId: createGameDto.roomId,
      },
    });
    return createGame;
  }

  async findAll() {
    const games = await prisma.games.findMany();
    return games;
  }

  async countGames() {
    const i = await prisma.games.count({
      where: {
        finishedAt: {
          not: null,
        },
      },
    });
    return i;
  }

  async findOne(id: number) {
    const game = await prisma.games.findUnique({
      where: { id: id },
    });
    return game;
  }
  async update(id: number, updateGameDto: UpdateGameDto) {
    const updateGame = await prisma.games.update({
      where: { id: id },
      data: {
        civilianWord: updateGameDto.civilianWord,
        undercoverWord: updateGameDto.undercoverWord,
        roomId: updateGameDto.roomId,
      },
    });
    return updateGame;
  }
  async remove(id: number) {
    const deleteGame = await prisma.games.update({
      where: { id: id },
      data: {
        finishedAt: new Date(),
      },
    });
    return deleteGame;
  }
}
