import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
  async findOne(@Param('id') id: string) {
    return this.gameService.findOne(+id);
  }

  @UseGuards(InternalApiKeyGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gameService.update(+id, updateGameDto);
  }

  @UseGuards(InternalApiKeyGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.gameService.remove(+id);
  }
}
