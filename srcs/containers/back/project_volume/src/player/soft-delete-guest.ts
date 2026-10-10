import { PrismaService } from '../prisma.service';

export function softDeleteGuest(prisma: PrismaService, id: number) {
  return prisma.player.update({
    where: { id, isGuest: true, deletedAt: null },
    data: { deletedAt: new Date(), name: `deleted_guest_${id}` },
  });
}
