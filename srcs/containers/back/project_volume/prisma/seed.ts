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

  if (await prisma.player.findUnique({ where: { email: "alice@prisma.io" } })) {
    console.log("demo data already seeded, skipping");
    return;
  }

  //players
  const alicePassword = await bcrypt.hash("Alice1234#", 10);
  const bobPassword = await bcrypt.hash("Bob1234#", 10);
  const marleyPassword = await bcrypt.hash("Marley1234#", 10);

  const alice = await prisma.player.upsert({
    where: { email: "alice@prisma.io" },
    update: { password: alicePassword },
    create: {
      name: "Alice",
      email: "alice@prisma.io",
            password: alicePassword,
      aboutMe: "im a princess",
    },
  });

  const bob = await prisma.player.upsert({
    where: { email: "bob@prisma.io" },
    update: { password: bobPassword },
    create: {
      name: "Bob",
      email: "bob@prisma.io",
            password: bobPassword,
      aboutMe: "im a king",
    },
  });

  const marley = await prisma.player.upsert({
    where: { email: "marley@prisma.io" },
    update: { password: marleyPassword },
    create: {
      name: "Marley",
      email: "marley@prisma.io",
      password: await marleyPassword,
      aboutMe: "i pull on main every morning",
    },
  });

  // rooms

  const aliceRoom = await prisma.rooms.create({
    data: {
      name: "alice's room",
      createdBy: alice.id,
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
