import type { Client } from '@colyseus/core';
import { PresenceRoom } from './PresenceRoom';
import { getFriendIds, getPlayer } from '../api';

jest.mock('@colyseus/core', () => ({
  Room: class {
    clients = Object.assign([] as { sessionId: string }[], {
      getById(this: { sessionId: string }[], id: string) {
        return this.find((client) => client.sessionId === id);
      },
    });
  },
}));

jest.mock('../api', () => ({
  getPlayer: jest.fn(),
  getFriendIds: jest.fn(),
}));

interface FakeClient {
  sessionId: string;
  auth: { id: number; isAdmin: boolean; friendIds: Set<number> };
  send: jest.Mock;
}

function connect(
  room: PresenceRoom,
  id: number,
  friendIds: number[] = [],
  isAdmin = false,
) {
  const client: FakeClient = {
    sessionId: `session-${id}`,
    auth: { id, isAdmin, friendIds: new Set(friendIds) },
    send: jest.fn(),
  };
  (room.clients as unknown as FakeClient[]).push(client);
  room.onJoin(client as unknown as Client);
  return client;
}

function disconnect(room: PresenceRoom, client: FakeClient) {
  const clients = room.clients as unknown as FakeClient[];
  clients.splice(clients.indexOf(client), 1);
  room.onLeave(client as unknown as Client);
}

function sentOnlineIds(client: FakeClient) {
  const calls = client.send.mock.calls as [string, unknown][];
  const call = calls.find(([type]) => type === 'onlineIds');
  return [...(call?.[1] as number[])].sort();
}

describe('PresenceRoom', () => {
  let room: PresenceRoom;

  beforeEach(() => {
    jest.clearAllMocks();
    room = new PresenceRoom();
  });

  describe('onAuth', () => {
    it('should load the accepted friends of a registered player', async () => {
      jest
        .mocked(getPlayer)
        .mockResolvedValue({ id: 1, isAdmin: false, isGuest: false });
      jest.mocked(getFriendIds).mockResolvedValue([2, 3]);

      const auth = await room.onAuth({} as Client, { token: 'token' });

      expect(getFriendIds).toHaveBeenCalledWith('token', 1);
      expect(auth).toEqual({
        id: 1,
        isAdmin: false,
        friendIds: new Set([2, 3]),
      });
    });

    it('should give guests no friends without calling the friendship api', async () => {
      jest
        .mocked(getPlayer)
        .mockResolvedValue({ id: 1, isAdmin: false, isGuest: true });

      const auth = await room.onAuth({} as Client, { token: 'token' });

      expect(getFriendIds).not.toHaveBeenCalled();
      expect(auth.friendIds.size).toBe(0);
    });

    it('should reject when the friends cannot be loaded', async () => {
      jest
        .mocked(getPlayer)
        .mockResolvedValue({ id: 1, isAdmin: false, isGuest: false });
      jest.mocked(getFriendIds).mockResolvedValue(null);

      await expect(
        room.onAuth({} as Client, { token: 'token' }),
      ).rejects.toThrow();
    });

    it('should reject an invalid token', async () => {
      jest.mocked(getPlayer).mockResolvedValue(null);

      await expect(
        room.onAuth({} as Client, { token: 'token' }),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('onJoin', () => {
    it('should only send the online ids of friends', () => {
      connect(room, 2, [1]);
      connect(room, 3);
      const player = connect(room, 1, [2]);

      expect(sentOnlineIds(player)).toEqual([1, 2]);
    });

    it('should only tell friends that a player came online', () => {
      const friend = connect(room, 2, [1]);
      const stranger = connect(room, 3);
      connect(room, 1, [2]);

      expect(friend.send).toHaveBeenCalledWith('online', { playerId: 1 });
      expect(stranger.send).not.toHaveBeenCalledWith('online', {
        playerId: 1,
      });
    });

    it('should let admins see every online player', () => {
      connect(room, 2);
      const admin = connect(room, 9, [], true);
      connect(room, 3);

      expect(sentOnlineIds(admin)).toEqual([2, 9]);
      expect(admin.send).toHaveBeenCalledWith('online', { playerId: 3 });
    });
  });

  describe('onLeave', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('should only tell friends that a player went offline after the grace period', () => {
      const friend = connect(room, 2, [1]);
      const stranger = connect(room, 3);
      const player = connect(room, 1, [2]);

      disconnect(room, player);
      expect(friend.send).not.toHaveBeenCalledWith('offline', { playerId: 1 });

      jest.advanceTimersByTime(3000);
      expect(friend.send).toHaveBeenCalledWith('offline', { playerId: 1 });
      expect(stranger.send).not.toHaveBeenCalledWith('offline', {
        playerId: 1,
      });
    });
  });

  describe('updateFriendship', () => {
    it('should share presence both ways once players become friends', () => {
      const a = connect(room, 1);
      const b = connect(room, 2);

      room.updateFriendship(1, 2, true);

      expect(a.send).toHaveBeenCalledWith('online', { playerId: 2 });
      expect(b.send).toHaveBeenCalledWith('online', { playerId: 1 });
      expect(a.auth.friendIds.has(2)).toBe(true);
      expect(b.auth.friendIds.has(1)).toBe(true);
    });

    it('should hide presence both ways once the friendship ends', () => {
      const a = connect(room, 1, [2]);
      const b = connect(room, 2, [1]);

      room.updateFriendship(2, 1, false);

      expect(a.send).toHaveBeenCalledWith('offline', { playerId: 2 });
      expect(b.send).toHaveBeenCalledWith('offline', { playerId: 1 });
      expect(a.auth.friendIds.has(2)).toBe(false);
      expect(b.auth.friendIds.has(1)).toBe(false);
    });

    it('should not touch players outside the friendship', () => {
      connect(room, 1);
      connect(room, 2);
      const other = connect(room, 3);

      room.updateFriendship(1, 2, true);

      expect(other.send).not.toHaveBeenCalledWith('online', expect.anything());
    });
  });
});
