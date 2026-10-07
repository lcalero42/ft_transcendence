import { Logger } from '@nestjs/common';
import { Room, type Client } from '@colyseus/core';
import { getPlayerId } from '../api';
import {
  registerPresenceRoom,
  unregisterPresenceRoom,
} from '../presence-pubsub';

interface JoinOptions {
  token?: string;
}

interface PresenceAuth {
  id: number;
}

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

    const id = await getPlayerId(options.token);
    if (!id) throw new Error('Unauthorized');

    return { id };
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
