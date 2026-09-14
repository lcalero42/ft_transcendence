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
  ParseIntPipe,
  Query,
  ParseEnumPipe,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { FriendshipStatus } from '../generated/prisma/enums';

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

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('status', new ParseEnumPipe(FriendshipStatus, { optional: true }))
    status?: FriendshipStatus,
  ) {
    return this.friendshipService.findAll(req.user.id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.friendshipService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFriendshipDto: UpdateFriendshipDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.friendshipService.update(id, updateFriendshipDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.friendshipService.remove(id);
  }
}
