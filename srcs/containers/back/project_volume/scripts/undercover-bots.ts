import { parseArgs } from 'node:util';
import { Client, type Room, type SeatReservation } from '@colyseus/sdk';
import {
  AUTH_COOKIE,
  tokenFromCookieHeader,
} from '../src/auth/auth-cookie-header';

type State = any;

const USAGE = `usage: make bots ARGS="[roomId] [options]"   (from the repo root, runs inside the back container)
       npm run bots -- [roomId] [options]   (from inside the back container)
  --bots <n>         number of bots (default 2)
  --delay <ms>        wait before each clue / vote (default 800)
  --vote-for <x>      random | none | <player name> (default random)
  --leave-in <phase>  last bot leaves when this phase is reached (describing | voting)
  --create            bots create and run the room themselves (Bot1 is host)
  --url <ws>          colyseus endpoint (default ws://localhost:2567)
  --api <http>        REST API used to log bots in as guests (default http://localhost:3000)

bots log in through POST /auth/guest, limited to 5 per minute per IP.`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    bots: { type: 'string', default: '2' },
    delay: { type: 'string', default: '800' },
    'vote-for': { type: 'string', default: 'random' },
    'leave-in': { type: 'string' },
    create: { type: 'boolean', default: false },
    url: { type: 'string', default: 'ws://localhost:2567' },
    api: { type: 'string', default: 'http://localhost:3000' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

const roomIdArg = positionals[0];
const botCount = Number(values.bots);
const delay = Number(values.delay);
const voteFor = values['vote-for'];
const leaveIn = values['leave-in'];

if (values.help || (!roomIdArg && !values.create) || !(botCount > 0)) {
  console.log(USAGE);
  process.exit(values.help ? 0 : 1);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const pickRandom = <T>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

class Bot {
  private client!: Client;
  private room: Room<any, State> | null = null;
  private acted = new Set<string>();
  private lastPhase = '';
  private pendingMove = false;
  moved = false;

  constructor(
    readonly name: string,
    private readonly isLast: boolean,
  ) {}

  log(message: string) {
    console.log(`[${this.name}] ${message}`);
  }

  async login() {
    const res = await fetch(`${values.api}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: this.name }),
    });
    if (!res.ok) {
      throw new Error(
        res.status === 429
          ? `${this.name}: too many guest logins, wait a minute and retry`
          : `${this.name}: guest login failed (${res.status})`,
      );
    }
    const token = res.headers
      .getSetCookie()
      .map(tokenFromCookieHeader)
      .find((value) => value !== null);
    if (!token) {
      throw new Error(`${this.name}: guest login returned no auth cookie`);
    }
    this.client = new Client(values.url, {
      headers: { Cookie: `${AUTH_COOKIE}=${token}` },
    });
  }

  async create() {
    this.attach(await this.client.create('undercover', { name: this.name }));
    return this.room!.roomId;
  }

  async join(roomId: string) {
    this.attach(await this.client.joinById(roomId, { name: this.name }));
  }

  send(type: string, payload?: unknown) {
    this.room?.send(type, payload);
  }

  get state(): State {
    return this.room?.state;
  }

  async leave() {
    await this.room?.leave().catch(() => undefined);
    this.room = null;
  }

  private attach(room: Room<any, State>) {
    this.room = room;
    this.acted.clear();
    this.lastPhase = '';
    this.pendingMove = false;

    room.onMessage('word', ({ word }: { word: string }) =>
      this.log(`word = ${word}`),
    );
    room.onMessage('seatReservation', (reservation: SeatReservation) => {
      void this.client.consumeSeatReservation(reservation).then((next) => {
        void room.leave();
        this.log('moved to game room');
        this.attach(next);
        this.moved = true;
      });
    });
    room.onStateChange((state: State) => this.onState(room, state));
    room.onLeave((code: number) => this.log(`left room (${code})`));
  }

  private onState(room: Room<any, State>, state: State) {
    if (room !== this.room) {
      return;
    }
    const { phase, round } = state;

    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      this.log(`phase -> ${phase}${round ? ` (round ${round})` : ''}`);
      this.onPhaseEnter(state);
    }

    if (this.isLast && phase === leaveIn && !this.acted.has('leave')) {
      this.acted.add('leave');
      this.log(`leaving during ${phase}`);
      void this.leave();
      return;
    }

    if (phase === 'setup') {
      this.pendingMove = true;
    }

    if (
      phase === 'open' &&
      !this.pendingMove &&
      !state.participants.includes(room.sessionId)
    ) {
      this.once('join', () => this.send('joinGame'));
    }

    if (
      phase === 'describing' &&
      state.turnOrder.at(state.currentTurnIndex) === room.sessionId
    ) {
      this.once(`clue:${round}`, async () => {
        await sleep(delay);
        const clue = `${this.name}-r${round}`;
        this.log(`clue: ${clue}`);
        this.send('submitClue', clue);
      });
    }

    if (
      phase === 'voting' &&
      voteFor !== 'none' &&
      state.alive.includes(room.sessionId)
    ) {
      this.once(`vote:${round}`, async () => {
        await sleep(delay);
        const target = this.pickTarget();
        if (!target) {
          return;
        }
        this.log(`vote -> ${this.state.players.get(target)?.name ?? target}`);
        this.send('castVote', target);
      });
    }
  }

  private onPhaseEnter(state: State) {
    if (state.phase === 'reveal') {
      const record = state.eliminationHistory.at(-1);
      this.log(
        record?.eliminatedSessionId
          ? `eliminated: ${record.eliminatedName} (${record.eliminatedRole})`
          : 'no one eliminated',
      );
    }
    if (state.phase === 'finished') {
      const roles: string[] = [];
      state.revealedRoles.forEach((role: string, sessionId: string) =>
        roles.push(`${state.players.get(sessionId)?.name ?? sessionId}=${role}`),
      );
      this.log(`winner: ${state.winner} | ${roles.join(', ')}`);
    }
  }

  private pickTarget(): string | undefined {
    const state = this.state;
    const me = this.room?.sessionId;
    const candidates: string[] = state.alive.filter((id: string) => id !== me);
    if (voteFor !== 'random') {
      const named = candidates.find(
        (id) => state.players.get(id)?.name === voteFor,
      );
      if (named) {
        return named;
      }
    }
    return pickRandom(candidates);
  }

  private once(key: string, action: () => void | Promise<void>) {
    if (this.acted.has(key)) {
      return;
    }
    this.acted.add(key);
    void action();
  }
}

async function waitFor(check: () => boolean, timeoutMs = 10_000) {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('timed out waiting for room state');
    }
    await sleep(100);
  }
}

async function main() {
  const runId = Math.floor(1000 + Math.random() * 9000);
  const bots = Array.from(
    { length: botCount },
    (_, i) => new Bot(`Bot${i + 1}_${runId}`, i === botCount - 1),
  );
  for (const bot of bots) {
    await bot.login();
  }

  process.on('SIGINT', () => {
    void Promise.all(bots.map((bot) => bot.leave())).then(() => process.exit(0));
  });

  const [host, ...others] = bots;
  const roomId = values.create ? await host.create() : roomIdArg;
  if (!values.create) {
    await host.join(roomId);
  }
  for (const bot of others) {
    await bot.join(roomId);
  }
  console.log(`room ${roomId}: ${botCount} bots connected`);

  if (!values.create) {
    return;
  }

  host.send('start');
  await waitFor(
    () =>
      bots.every((bot) => bot.moved) &&
      host.state?.participants.length >= botCount,
  );
  host.send('startGame');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
