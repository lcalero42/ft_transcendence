import { Logger } from '@nestjs/common';
import { Room, type Client } from '@colyseus/core';
import { getFriendIds, getPlayer } from '../api';
import {
  registerPresenceRoom,
  unregisterPresenceRoom,
} from '../presence-pubsub';

interface JoinOptions {
  token?: string;
}

interface PresenceAuth {
  id: number;
  isAdmin: boolean;
  friendIds: Set<number>;
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

    const player = await getPlayer(options.token);
    if (!player) throw new Error('Unauthorized');

    const friendIds = player.isGuest
      ? []
      : await getFriendIds(options.token, player.id);
    if (!friendIds) throw new Error('Could not load friends');

    return {
      id: player.id,
      isAdmin: player.isAdmin,
      friendIds: new Set(friendIds),
    };
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
    client.send(
      'onlineIds',
      Array.from(this.sessionIdByPlayerId.keys()).filter(
        (id) => id === auth.id || this.canSee(auth, id),
      ),
    );
    this.sendToViewers(auth.id, 'online');
  }

  onLeave(client: Client) {
    const auth = client.auth as PresenceAuth;
    if (this.sessionIdByPlayerId.get(auth.id) === client.sessionId) {
      this.sessionIdByPlayerId.delete(auth.id);
      this.offlineTimerByPlayerId.set(
        auth.id,
        setTimeout(() => {
          this.offlineTimerByPlayerId.delete(auth.id);
          this.sendToViewers(auth.id, 'offline');
        }, OFFLINE_GRACE_MS),
      );
    }
  }

  onDispose() {
    this.offlineTimerByPlayerId.forEach(clearTimeout);
    this.logger.log('presence room disposed');
    unregisterPresenceRoom(this);
  }

  notifyPlayer(playerId: number, type: string, payload: unknown): boolean {
    const sessionId = this.sessionIdByPlayerId.get(playerId);
    if (!sessionId) return false;
    const client = this.clients.getById(sessionId);
    client?.send(type, payload);
    return !!client;
  }

  updateFriendship(playerId: number, otherId: number, friends: boolean) {
    for (const client of this.clients) {
      const viewer = client.auth as PresenceAuth;
      const target =
        viewer.id === playerId
          ? otherId
          : viewer.id === otherId
            ? playerId
            : undefined;
      if (target === undefined) continue;
      if (friends) viewer.friendIds.add(target);
      else viewer.friendIds.delete(target);
      const visible =
        this.canSee(viewer, target) && this.sessionIdByPlayerId.has(target);
      client.send(visible ? 'online' : 'offline', { playerId: target });
    }
  }

  private canSee(viewer: PresenceAuth, playerId: number) {
    return viewer.isAdmin || viewer.friendIds.has(playerId);
  }

  private sendToViewers(playerId: number, type: 'online' | 'offline') {
    for (const client of this.clients) {
      const viewer = client.auth as PresenceAuth;
      if (viewer.id !== playerId && this.canSee(viewer, playerId)) {
        client.send(type, { playerId });
      }
    }
  }
}
