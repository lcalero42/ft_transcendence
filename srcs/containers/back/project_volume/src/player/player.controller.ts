import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  ForbiddenException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

import { PlayerService } from './player.service';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { RolesGuard } from '../common/roles.guard';
import { adminOnly } from '../common/roles.decorator';

const AVATAR_MIME_TO_EXT = new Map<string, string>([
  ['image/png', '.png'],
  ['image/jpeg', '.jpg'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @adminOnly()
  @Get()
  async findAll() {
    return this.playerService.findAll();
  }

  @Get('count-activ')
  async countPlayerActiv() {
    return this.playerService.countPlayerActiv();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.playerService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @adminOnly()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.playerService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/games')
  async getGamesList(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== +id) {
      throw new ForbiddenException('Cannot view games of another player');
    }
    return this.playerService.getGamesList(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== +id) {
      throw new ForbiddenException('Cannot edit another player');
    }
    return this.playerService.update(+id, updatePlayerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (req.user.id !== +id) {
      throw new ForbiddenException('Cannot delete another player');
    }
    return this.playerService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/games-played')
  async countGamesPlayed(@Param('id') id: string) {
    return this.playerService.countGamesPlayed(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/victory')
  async countVictory(@Param('id') id: string) {
    return this.playerService.countVictory(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/winrate')
  async getWinrate(@Param('id') id: string) {
    return this.playerService.getWinrate(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/about-me')
  async getAboutMe(@Param('id') id: string) {
    return this.playerService.getAboutMe(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = AVATAR_MIME_TO_EXT.get(file.mimetype);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!AVATAR_MIME_TO_EXT.has(file.mimetype)) {
          callback(
            new UnsupportedMediaTypeException(
              'Avatar must be a PNG, JPEG, WEBP, or GIF image',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== +id) {
      throw new ForbiddenException('Cannot edit another player');
    }
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.playerService.updateAvatar(+id, avatarUrl);
  }
}
