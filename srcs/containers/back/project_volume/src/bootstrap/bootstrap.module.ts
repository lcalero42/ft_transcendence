import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BootstrapService } from './bootstrap.service';

@Module({
  providers: [PrismaService, BootstrapService],
})
export class BootstrapModule {}
