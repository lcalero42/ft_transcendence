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
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import {detectImageType} from './avatar-validation';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  AVATAR_DIR,
  AVATAR_URL_PREFIX,
  AVATAR_MAX_SIZE,
  AVATAR_OUTPUT_SIZE,
  AVATAR_MAX_INPUT_PIXELS,
  AVATAR_MIMES,
} from './avatar.constants';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @UseGuards(JwtAuthGuard)
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
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playerService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/games')
  async getGamesList(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot view games of another player');
    }
    return this.playerService.getGamesList(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot edit another player');
    }
    return this.playerService.update(id, updatePlayerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot delete another player');
    }
    return this.playerService.remove(id);
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
	  limits: {fileSize: AVATAR_MAX_SIZE, files: 1},
	  fileFilter: (req, file, callback) => {
		if (!AVATAR_MIMES.has(file.mimetype)) {
			callback(
				new UnsupportedMediaTypeException('Avatar must be a PNG, JPEG, WEBP, or GIF image'),
				false,
			);
			return;
		}
		callback(null,true);
	  },
    }),
  )
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot edit another player');
    }
    if (!file) {
      throw new BadRequestException('No avatar file was uploaded');
    }
 	if (!detectImageType(file.buffer)) {
      throw new UnsupportedMediaTypeException('File content is not a valid image');
    }
	const filename = `${randomUUID()}.webp`;
	try {
   	  await sharp(file.buffer, { limitInputPixels: AVATAR_MAX_INPUT_PIXELS })
		.rotate()
		.resize(AVATAR_OUTPUT_SIZE,AVATAR_OUTPUT_SIZE, {fit: 'cover'})
		.webp({quality:80})
		.toFile(join(AVATAR_DIR, filename));
	} catch {
    	throw new BadRequestException('Image is corrupted or unsupported');
	}
    return this.playerService.updateAvatar(id, `${AVATAR_URL_PREFIX}${filename}`);
  }

}
