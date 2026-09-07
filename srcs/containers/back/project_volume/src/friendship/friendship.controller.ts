import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createFriendshipDto: CreateFriendshipDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.friendshipService.create(createFriendshipDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.friendshipService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendshipService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFriendshipDto: UpdateFriendshipDto) {
    return this.friendshipService.update(+id, updateFriendshipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendshipService.remove(+id);
  }
}
