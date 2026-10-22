import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InternalApiKeyGuard } from '../common/internal-api-key.guard';
import { adminOnly } from '../common/roles.decorator';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import type { Rooms } from '../generated/prisma/client';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.roomService.create(req.user.id, createRoomDto);
  }

  @Get()
  async findAll() {
    return this.roomService.findAll();
  }

  @Get(`current`)
  async findCurrent() {
    return this.roomService.findCurrent();
  }
  @Get('count-activ')
  async countActiv() {
    return this.roomService.countActiv();
  }

  @UseGuards(JwtAuthGuard)
  @Get('live/:colyseusRoomId/banned')
  async isBanned(
    @Param('colyseusRoomId') colyseusRoomId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.roomService.isBanned(colyseusRoomId, req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findOne(id);
  }

  @adminOnly()
  @Get(':id/games')
  async getGames(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.getGames(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @Req() req: AuthenticatedRequest,
  ) {
    let room: Rooms | null = null;
    try {
      room = await this.roomService.findOne(id);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }
    if (!room || room.createdBy !== req.user.id) {
      throw new ForbiddenException('Cannot edit a room you did not create');
    }
    return this.roomService.update(id, updateRoomDto);
  }

  @UseGuards(InternalApiKeyGuard)
  @Delete('internal/:id')
  async close(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    let room: Rooms | null = null;
    try {
      room = await this.roomService.findOne(id);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }
    if (!room || room.createdBy !== req.user.id) {
      throw new ForbiddenException('Cannot delete a room you did not create');
    }
    return this.roomService.remove(id);
  }
}
