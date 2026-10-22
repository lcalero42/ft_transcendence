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
    await this.upsertAdmin();
    await this.upsertWordPairs();
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

  private async upsertAdmin() {
    const email = requireEnv('ADMIN_EMAIL');
    const password = await bcrypt.hash(requireEnv('ADMIN_PASSWORD'), 10);
    await this.prisma.player.upsert({
      where: { email },
      update: { password, isAdmin: true },
      create: { name: 'admin', email, password, isAdmin: true },
    });
    this.logger.log('admin account ready');
  }

  private async upsertWordPairs() {
    for (const pair of WORD_PAIRS) {
      const { civilianWord, undercoverWord } = pair;
      await this.prisma.word_Pair.upsert({
        where: {
          civilianWord_undercoverWord: { civilianWord, undercoverWord },
        },
        update: pair,
        create: pair,
      });
    }
    this.logger.log(`${WORD_PAIRS.length} word pairs ready`);
  }
}
