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
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/authenticated-request';

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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roomService.findOne(+id);
  }

  @Get(':id/games')
  async getGames(@Param('id') id: string) {
    return this.roomService.getGames(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const room = await this.roomService.findOne(+id);
    if (!room || room.createdBy !== req.user.id) {
      throw new ForbiddenException('Cannot edit a room you did not create');
    }
    return this.roomService.update(+id, updateRoomDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const room = await this.roomService.findOne(+id);
    if (!room || room.createdBy !== req.user.id) {
      throw new ForbiddenException('Cannot delete a room you did not create');
    }
    return this.roomService.remove(+id);
  }
}
