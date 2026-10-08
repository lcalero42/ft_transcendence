import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { softDeleteGuest } from './soft-delete-guest';

const GUEST_MAX_AGE_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class GuestCleanupService {
  private readonly logger = new Logger('GuestCleanup');

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async removeExpiredGuests() {
    const guests = await this.prisma.player.findMany({
      where: {
        isGuest: true,
        deletedAt: null,
        createdAt: { lt: new Date(Date.now() - GUEST_MAX_AGE_MS) },
      },
      select: { id: true },
    });
    for (const { id } of guests) {
      await softDeleteGuest(this.prisma, id);
    }
    if (guests.length > 0) {
      this.logger.log(`cleaned up ${guests.length} expired guests`);
    }
  }
}
