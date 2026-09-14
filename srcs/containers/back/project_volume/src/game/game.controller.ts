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
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InternalApiKeyGuard } from '../common/internal-api-key.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(InternalApiKeyGuard)
  @Post()
  async create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @Get()
  async findAll() {
    return this.gameService.findAll();
  }

  @Get('count')
  async countGames() {
    return this.gameService.countGames();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.findOne(id);
  }

  @Get(':id/players')
  async getPlayersByGame(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.getPlayersByGame(id);
  }

  @UseGuards(InternalApiKeyGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gameService.update(id, updateGameDto);
  }

  @UseGuards(InternalApiKeyGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.remove(id);
  }
}
