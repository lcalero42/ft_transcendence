import { PrismaService } from '../prisma.service';

let instance: PrismaService | undefined;

export function setPrisma(prisma: PrismaService) {
  instance = prisma;
}

export function getPrisma(): PrismaService {
  if (!instance) {
    throw new Error('Prisma not initialized');
  }
  return instance;
}
