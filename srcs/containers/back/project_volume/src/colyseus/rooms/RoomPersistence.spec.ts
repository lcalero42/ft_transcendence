import { RoomPersistence } from './RoomPersistence';
import { createRoom, createGame, type WordPair } from '../api';
import type { Role } from './undercoverGameLogic';

jest.mock('../api', () => ({
  createRoom: jest.fn(),
  closeRoom: jest.fn(),
  createGame: jest.fn(),
  eliminatePlayer: jest.fn(),
  finishGame: jest.fn(),
  abortGame: jest.fn(),
}));

const createRoomMock = createRoom as jest.Mock;
const createGameMock = createGame as jest.Mock;

const pair: WordPair = {
  civilianWord: 'cat',
  undercoverWord: 'dog',
  civilianWordFr: 'chat',
  undercoverWordFr: 'chien',
  civilianWordEs: 'gato',
  undercoverWordEs: 'perro',
};
const roles = new Map<string, Role>([['s1', 'civilian']]);

describe('RoomPersistence', () => {
  let persistence: RoomPersistence;

  beforeEach(() => {
    jest.clearAllMocks();
    persistence = new RoomPersistence();
  });

  describe('saveRoom', () => {
    it('should return false when the host has no token', async () => {
      expect(await persistence.saveRoom(undefined, 'Bob', 'abc')).toBe(false);
      expect(createRoomMock).not.toHaveBeenCalled();
    });

    it('should return false when the room could not be created', async () => {
      createRoomMock.mockResolvedValue(null);

      expect(await persistence.saveRoom('token', 'Bob', 'abc')).toBe(false);
    });

    it('should return true when the room was created', async () => {
      createRoomMock.mockResolvedValue(7);

      expect(await persistence.saveRoom('token', 'Bob', 'abc')).toBe(true);
    });
  });

  describe('saveGame', () => {
    it('should return false when the room was never saved', async () => {
      expect(await persistence.saveGame(pair, roles)).toBe(false);
      expect(createGameMock).not.toHaveBeenCalled();
    });

    it('should return false when the game could not be created', async () => {
      createRoomMock.mockResolvedValue(7);
      createGameMock.mockResolvedValue(null);
      await persistence.saveRoom('token', 'Bob', 'abc');

      expect(await persistence.saveGame(pair, roles)).toBe(false);
    });

    it('should save the game in the saved room', async () => {
      createRoomMock.mockResolvedValue(7);
      createGameMock.mockResolvedValue(12);
      persistence.trackPlayer('s1', 4);
      await persistence.saveRoom('token', 'Bob', 'abc');

      expect(await persistence.saveGame(pair, roles)).toBe(true);
      expect(createGameMock).toHaveBeenCalledWith(7, pair, [
        { playerId: 4, role: 'civilian' },
      ]);
    });
  });
});
