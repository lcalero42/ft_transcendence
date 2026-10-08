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
import { WordPairService } from './word_pair.service';
import { CreateWordPairDto } from './dto/create-word_pair.dto';
import { UpdateWordPairDto } from './dto/update-word_pair.dto';
import { adminOnly } from '../common/roles.decorator';
import { InternalApiKeyGuard } from '../common/internal-api-key.guard';

@Controller('word-pair')
export class WordPairController {
  constructor(private readonly wordPairService: WordPairService) {}

  @adminOnly()
  @Post()
  async create(@Body() createWordPairDto: CreateWordPairDto) {
    return this.wordPairService.create(createWordPairDto);
  }

  @adminOnly()
  @Get()
  async findAll() {
    return this.wordPairService.findAll();
  }

  @UseGuards(InternalApiKeyGuard)
  @Get('internal')
  async findAllInternal() {
    return this.wordPairService.findAll();
  }

  @adminOnly()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordPairService.findOne(id);
  }

  @adminOnly()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWordPairDto: UpdateWordPairDto,
  ) {
    return this.wordPairService.update(id, updateWordPairDto);
  }

  @adminOnly()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.wordPairService.remove(id);
  }
}
