import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
type AuthenticatedRequest = Request & { user: { id: number; email: string } };

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  async create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playerService.create(createPlayerDto);
  }

  @Get()
  async findAll() {
    return this.playerService.findAll();
  }

  @Get('count-activ')
  async countPlayerActiv() {
    return this.playerService.countPlayerActiv();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.playerService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.playerService.findOne(req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    return this.playerService.update(+id, updatePlayerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.playerService.remove(+id);
  }

  @Get(':id/games-played')
  async countGamesPlayed(@Param('id') id: string) {
    return this.playerService.countGamesPlayed(+id);
  }

  @Get(':id/victory')
  async countVictory(@Param('id') id: string) {
    return this.playerService.countVictory(+id);
  }

  @Get(':id/winrate')
  async getWinrate(@Param('id') id: string) {
    return this.playerService.getWinrate(+id);
  }

  @Get(':id/about-me')
  async getAboutMe(@Param('id') id: string) {
    return this.playerService.getAboutMe(+id);
  }

  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async updateAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.playerService.updateAvatar(+id, avatarUrl);
  }
}
