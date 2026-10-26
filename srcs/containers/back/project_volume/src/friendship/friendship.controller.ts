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
import { Throttle } from '@nestjs/throttler';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotGuestGuard } from '../auth/not-guest.guard';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { FriendshipStatus } from '../generated/prisma/enums';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtAuthGuard, NotGuestGuard)
  @Post()
  create(
    @Body() createFriendshipDto: CreateFriendshipDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.friendshipService.create(createFriendshipDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, NotGuestGuard)
  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('status', new ParseEnumPipe(FriendshipStatus, { optional: true }))
    status?: FriendshipStatus,
  ) {
    return this.friendshipService.findAll(req.user.id, status);
  }

  @UseGuards(JwtAuthGuard, NotGuestGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.friendshipService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, NotGuestGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFriendshipDto: UpdateFriendshipDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.friendshipService.update(id, updateFriendshipDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, NotGuestGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.friendshipService.remove(id, req.user.id);
  }
}
