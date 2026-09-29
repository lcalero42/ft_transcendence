import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { EliminatePlayerDto } from './dto/eliminate-player.dto';
import { FinishGameDto } from './dto/finish-game.dto';
import { InternalApiKeyGuard } from '../common/internal-api-key.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(InternalApiKeyGuard)
  @Post()
  async create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.gameService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('count')
  async countGames() {
    return this.gameService.countGames();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/players')
  async getPlayersByGame(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.getPlayersByGame(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/my-word')
  async getMyWord(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.gameService.getMyWord(id, req.user.id);
  }

  @UseGuards(InternalApiKeyGuard)
  @Patch(':id/eliminate')
  async eliminate(
    @Param('id', ParseIntPipe) id: number,
    @Body() eliminatePlayerDto: EliminatePlayerDto,
  ) {
    return this.gameService.eliminate(id, eliminatePlayerDto.playerId);
  }

  @UseGuards(InternalApiKeyGuard)
  @Patch(':id/finish')
  async finish(
    @Param('id', ParseIntPipe) id: number,
    @Body() finishGameDto: FinishGameDto,
  ) {
    return this.gameService.finish(id, finishGameDto.victory);
  }

  @UseGuards(InternalApiKeyGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.remove(id);
  }
}
