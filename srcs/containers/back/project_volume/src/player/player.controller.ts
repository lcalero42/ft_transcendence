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
  BadRequestException,
  ForbiddenException,
  UnsupportedMediaTypeException,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { adminOnly } from '../common/roles.decorator';
import { PlayerService } from './player.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotGuestGuard } from '../auth/not-guest.guard';
import { clearAuthCookie } from '../auth/auth-cookie';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { detectImageType } from './avatar-validation';
import { saveAvatar } from './avatar-storage';
import { AVATAR_MAX_SIZE, AVATAR_MIMES } from './avatar.constants';
import { apiError } from '../common/api-error';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

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

  @UseGuards(JwtAuthGuard)
  @Get('profile/:name')
  async getPublicProfile(@Param('name') name: string) {
    return this.playerService.findPublicProfile(name);
  }

  @adminOnly()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playerService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/games')
  async getGamesList(@Param('id', ParseIntPipe) id: number) {
    return this.playerService.getGamesList(id);
  }

  @UseGuards(JwtAuthGuard, NotGuestGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException(
        apiError('CANNOT_EDIT_OTHER_PLAYER', 'Cannot edit another player'),
      );
    }
    return this.playerService.update(id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException(
        apiError('CANNOT_DELETE_OTHER_PLAYER', 'Cannot delete another player'),
      );
    }
    const deleted = await this.playerService.remove(id);
    clearAuthCookie(res);
    return deleted;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/games-played')
  async countGamesPlayed(@Param('id', ParseIntPipe) id: number) {
    return this.playerService.countGamesPlayed(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/victory')
  async countVictory(@Param('id', ParseIntPipe) id: number) {
    return this.playerService.countVictory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/winrate')
  async getWinrate(@Param('id', ParseIntPipe) id: number) {
    return this.playerService.getWinrate(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/about-me')
  async getAboutMe(@Param('id', ParseIntPipe) id: number) {
    return this.playerService.getAboutMe(id);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(JwtAuthGuard, NotGuestGuard)
  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: AVATAR_MAX_SIZE, files: 1 },
      fileFilter: (req, file, callback) => {
        if (!AVATAR_MIMES.has(file.mimetype)) {
          callback(
            new UnsupportedMediaTypeException(
              apiError(
                'AVATAR_INVALID_TYPE',
                'Avatar must be a PNG, JPEG, WEBP, or GIF image',
              ),
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException(
        apiError('CANNOT_EDIT_OTHER_PLAYER', 'Cannot edit another player'),
      );
    }
    if (!file) {
      throw new BadRequestException(
        apiError('AVATAR_MISSING', 'No avatar file was uploaded'),
      );
    }
    if (!detectImageType(file.buffer)) {
      throw new UnsupportedMediaTypeException(
        apiError('AVATAR_INVALID_TYPE', 'File content is not a valid image'),
      );
    }
    let avatarUrl: string;
    try {
      avatarUrl = await saveAvatar(file.buffer);
    } catch {
      throw new BadRequestException(
        apiError('AVATAR_CORRUPTED', 'Image is corrupted or unsupported'),
      );
    }
    return this.playerService.updateAvatar(id, avatarUrl);
  }
}
