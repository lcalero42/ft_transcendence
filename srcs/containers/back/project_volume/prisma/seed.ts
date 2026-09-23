import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as bcrypt from 'bcrypt';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {

  //players

  const alice = await prisma.player.upsert({
    where: { email: "alice@prisma.io" },
    update: {},
    create: {
      name: "Alice",
      email: "alice@prisma.io",
            password: await bcrypt.hash("Alice1234#", 10),
      aboutMe: "im a princess",
    },
  });

  const bob = await prisma.player.upsert({
    where: { email: "bob@prisma.io" },
    update: {},
    create: {
      name: "Bob",
      email: "bob@prisma.io",
            password: await bcrypt.hash("Bob1234#", 10),
      aboutMe: "im a king",
    },
  });

  const marley = await prisma.player.upsert({
    where: { email: "marley@prisma.io" },
    update: {},
    create: {
      name: "Marley",
      email: "marley@prisma.io",
      password: await bcrypt.hash("Marley1234#", 10),
      aboutMe: "i pull on main every morning",
    },
  });

  // rooms

  const aliceRoom = await prisma.rooms.create({
    data: {
      name: "alice's room",
      createdBy: 1,
    },
  });

  // games

  const aliceRoomGame1 = await prisma.games.create({
    data: {
      status: "finished",
      victory: "undercover",
      civilianWord: "chat",
      undercoverWord: "tigre",
      roomId: aliceRoom.id,
      finishedAt: new Date(),
    }
  });

  const aliceRoomGame2 = await prisma.games.create({
    data: {
      status: "finished",
      victory: "undercover",
      civilianWord: "lapin",
      undercoverWord: "cheval",
      roomId: aliceRoom.id,
      finishedAt: new Date(),
    }
  });

  const aliceRoomGame3 = await prisma.games.create({
    data: {
      status: "playing",
      victory: null,
      civilianWord: "volcan",
      undercoverWord: "montagne",
      roomId: aliceRoom.id,
      finishedAt: null,
    }
  });

  // gamePlayers

  const aliceGamePlayer_1 = await prisma.game_Players.create({
    data: {
      role: "undercover",
      gameId: aliceRoomGame1.id,
      playerId: alice.id
    }
  })

  const bobGamePlayer_1 = await prisma.game_Players.create({
    data: {
      role: "civilian",
      gameId: aliceRoomGame1.id,
      playerId: bob.id
    }
  })

  const marleyGamePlayer_1 = await prisma.game_Players.create({
    data: {
      role: "civilian",
      gameId: aliceRoomGame1.id,
      playerId: marley.id
    }
  })

  const aliceGamePlayer_2 = await prisma.game_Players.create({
    data: {
      role: "civilian",
      gameId: aliceRoomGame3.id,
      playerId: alice.id
    }
  })

  const bobGamePlayer_2 = await prisma.game_Players.create({
    data: {
      role: "civilian",
      gameId: aliceRoomGame3.id,
      playerId: bob.id
    }
  })

  const marleyGamePlayer_2 = await prisma.game_Players.create({
    data: {
      role: "undercover",
      gameId: aliceRoomGame3.id,
      playerId: marley.id
    }
  })

  const aliceGamePlayer_3 = await prisma.game_Players.create({
    data: {
      role: "undercover",
      gameId: aliceRoomGame3.id,
      playerId: alice.id
    }
  })

  const bobGamePlayer_3 = await prisma.game_Players.create({
    data: {
      role: "civilian",
      gameId: aliceRoomGame3.id,
      playerId: bob.id
    }
  })

  const marleyGamePlayer_3 = await prisma.game_Players.create({
    data: {
      role: "civilian",
      gameId: aliceRoomGame3.id,
      playerId: marley.id
    }
  })

  // wordPairs

  const wp_1 = await prisma.word_Pair.create({
    data: {
      civilianWord: "lapin",
      undercoverWord: "cheval"
    }
  })

  const wp_2 = await prisma.word_Pair.create({
    data: {
      civilianWord: "chat",
      undercoverWord: "tigre"
    }
  })

  const wp_3 = await prisma.word_Pair.create({
    data: {
      civilianWord: "telephone",
      undercoverWord: "ordinateur"
    }
  })

  console.log({ alice, bob, aliceRoom });
}
main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
