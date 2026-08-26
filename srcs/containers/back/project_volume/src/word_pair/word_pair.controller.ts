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
import { WordPairService } from './word_pair.service';
import { CreateWordPairDto } from './dto/create-word_pair.dto';
import { UpdateWordPairDto } from './dto/update-word_pair.dto';
import { InternalApiKeyGuard } from '../common/internal-api-key.guard';

@Controller('word-pair')
export class WordPairController {
  constructor(private readonly wordPairService: WordPairService) {}

  @UseGuards(InternalApiKeyGuard)
  @Post()
  async create(@Body() createWordPairDto: CreateWordPairDto) {
    return this.wordPairService.create(createWordPairDto);
  }

  @Get()
  async findAll() {
    return this.wordPairService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.wordPairService.findOne(+id);
  }

  @UseGuards(InternalApiKeyGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWordPairDto: UpdateWordPairDto,
  ) {
    return this.wordPairService.update(+id, updateWordPairDto);
  }

  @UseGuards(InternalApiKeyGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.wordPairService.remove(+id);
  }
}
