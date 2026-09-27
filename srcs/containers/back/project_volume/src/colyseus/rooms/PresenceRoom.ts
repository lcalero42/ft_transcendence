import { Logger } from '@nestjs/common';
import { Room, type Client } from '@colyseus/core';
import jwt from 'jsonwebtoken';
import { requireEnv } from '../../common/require-env';
import { PrismaService } from '../../prisma.service';
import {
  registerPresenceRoom,
  unregisterPresenceRoom,
} from '../presence-pubsub';

interface JoinOptions {
  token?: string;
}

interface PresenceAuth {
  id: number;
  email: string;
}

const prisma = new PrismaService();

export class PresenceRoom extends Room {
  private readonly logger = new Logger('PresenceRoom');
  private readonly sessionIdByPlayerId = new Map<number, string>();

  async onAuth(_client: Client, options?: JoinOptions): Promise<PresenceAuth> {
    if (!options?.token) throw new Error('Missing token');

    let payload: { sub: number; email: string };
    try {
      payload = jwt.verify(
        options.token,
        requireEnv('JWT_SECRET'),
      ) as unknown as {
        sub: number;
        email: string;
      };
    } catch {
      throw new Error('Invalid token');
    }

    const player = await prisma.player.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, email: true },
    });
    if (!player) throw new Error('Unauthorized');

    return player;
  }

  onCreate() {
    this.logger.log('presence room created');
    registerPresenceRoom(this);
  }

  onJoin(client: Client) {
    const auth = client.auth as PresenceAuth;
    this.sessionIdByPlayerId.set(auth.id, client.sessionId);
    client.send('onlineIds', Array.from(this.sessionIdByPlayerId.keys()));
    this.broadcast('online', { playerId: auth.id }, { except: client });
  }

  onLeave(client: Client) {
    const auth = client.auth as PresenceAuth;
    if (this.sessionIdByPlayerId.get(auth.id) === client.sessionId) {
      this.sessionIdByPlayerId.delete(auth.id);
    }
    this.broadcast('offline', { playerId: auth.id });
  }

  onDispose() {
    this.logger.log('presence room disposed');
    unregisterPresenceRoom(this);
  }

  notifyPlayer(playerId: number, type: string, payload: unknown) {
    const sessionId = this.sessionIdByPlayerId.get(playerId);
    if (!sessionId) return;
    this.clients.getById(sessionId)?.send(type, payload);
  }
}
