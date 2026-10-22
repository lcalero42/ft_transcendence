import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { requireEnv } from '../common/require-env';
import { WORD_PAIRS } from './word-pairs.data';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Bootstrap');

  constructor(private prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.upsertAdmins();
    await this.seedWordPairs();
    await this.closeStaleRooms();
  }

  private async closeStaleRooms() {
    const now = new Date();
    const games = await this.prisma.games.updateMany({
      where: { finishedAt: null },
      data: { status: 'aborted', finishedAt: now },
    });
    const rooms = await this.prisma.rooms.updateMany({
      where: { deletedAt: null },
      data: { deletedAt: now },
    });
    this.logger.log(
      `closed ${rooms.count} stale rooms and ${games.count} unfinished games`,
    );
  }

  private parseAdmins() {
    const lines = requireEnv('ADMINS')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      throw new Error('ADMINS must list at least one admin');
    }
    return lines.map((line, index) => {
      const first = line.indexOf(':');
      const second = line.indexOf(':', first + 1);
      const name = line.slice(0, first);
      const email = line.slice(first + 1, second);
      const password = line.slice(second + 1);
      if (first < 0 || second < 0 || !name || !email || !password) {
        throw new Error(
          `ADMINS line ${index + 1} must be formatted as name:email:password`,
        );
      }
      return { name, email, password };
    });
  }

  private async upsertAdmins() {
    const admins = this.parseAdmins();
    for (const admin of admins) {
      const { name, email } = admin;
      const password = await bcrypt.hash(admin.password, 10);
      await this.prisma.player.upsert({
        where: { name },
        update: { email, password, isAdmin: true },
        create: { name, email, password, isAdmin: true },
      });
    }
    this.logger.log(`${admins.length} admin accounts ready`);
  }

  private async seedWordPairs() {
    const count = await this.prisma.word_Pair.count();
    if (count > 0) {
      this.logger.log(`${count} word pairs already present, skipping seed`);
      return;
    }
    await this.prisma.word_Pair.createMany({ data: WORD_PAIRS });
    this.logger.log(`${WORD_PAIRS.length} word pairs seeded`);
  }
}
