import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnApplicationShutdown
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({
      adapter,
      omit: {
        player: {
          password: true,
        },
      },
    });
  }

  async onApplicationShutdown() {
    await this.$disconnect();
  }
}
