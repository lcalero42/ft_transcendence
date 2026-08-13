import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post(':playerId')
  async create(
    @Param('playerId') playerId: string,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.create(+playerId, createRoomDto);
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roomService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
