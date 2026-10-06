import { Logger } from '@nestjs/common';
import { Room, type Client } from '@colyseus/core';
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

// Colyseus ne parle à la base que via l'API Nest (pas d'accès direct à Prisma)
const API_URL =
  process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
// Délai avant d'annoncer "offline", pour absorber les reloads et reconnexions
const OFFLINE_GRACE_MS = 3000;

export class PresenceRoom extends Room {
  private readonly logger = new Logger('PresenceRoom');
  private readonly sessionIdByPlayerId = new Map<number, string>();
  private readonly offlineTimerByPlayerId = new Map<
    number,
    ReturnType<typeof setTimeout>
  >();

  async onAuth(_client: Client, options?: JoinOptions): Promise<PresenceAuth> {
    if (!options?.token) throw new Error('Missing token');

    let res: Response;
    try {
      res = await fetch(`${API_URL}/player/me`, {
        headers: { Authorization: `Bearer ${options.token}` },
      });
    } catch {
      throw new Error('Auth service unavailable');
    }
    if (!res.ok) throw new Error('Unauthorized');

    const { id, email } = (await res.json()) as PresenceAuth;
    return { id, email };
  }

  onCreate() {
    this.logger.log('presence room created');
    registerPresenceRoom(this);
  }

  onJoin(client: Client) {
    const auth = client.auth as PresenceAuth;
    clearTimeout(this.offlineTimerByPlayerId.get(auth.id));
    this.offlineTimerByPlayerId.delete(auth.id);
    this.sessionIdByPlayerId.set(auth.id, client.sessionId);
    client.send('onlineIds', Array.from(this.sessionIdByPlayerId.keys()));
    this.broadcast('online', { playerId: auth.id }, { except: client });
  }

  onLeave(client: Client) {
    const auth = client.auth as PresenceAuth;
    if (this.sessionIdByPlayerId.get(auth.id) === client.sessionId) {
      this.sessionIdByPlayerId.delete(auth.id);
      this.offlineTimerByPlayerId.set(
        auth.id,
        setTimeout(() => {
          this.offlineTimerByPlayerId.delete(auth.id);
          this.broadcast('offline', { playerId: auth.id });
        }, OFFLINE_GRACE_MS),
      );
    }
  }

  onDispose() {
    this.offlineTimerByPlayerId.forEach(clearTimeout);
    this.logger.log('presence room disposed');
    unregisterPresenceRoom(this);
  }

  notifyPlayer(playerId: number, type: string, payload: unknown) {
    const sessionId = this.sessionIdByPlayerId.get(playerId);
    if (!sessionId) return;
    this.clients.getById(sessionId)?.send(type, payload);
  }
}
