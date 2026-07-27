import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const alice = await prisma.player.upsert({
	where: { email: "alice@prisma.io" },
	update: {},
	create: {
		name: "Alice",
		email: "alice@prisma.io",
	},
  });

  const bob = await prisma.player.upsert({
	where: { email: "bob@prisma.io" },
	update: {},
	create: {
		name: "Bob",
		email: "bob@prisma.io",
	},
  });

  const marley = await prisma.player.upsert({
	where: { email: "marley@prisma.io" },
	update: {},
	create: {
		name: "Marley",
		email: "marley@prisma.io",
	},
  });

  const aliceRoom = await prisma.rooms.upsert({
    where: { createdBy: alice.id },
    update: {},
    create: {
      name: "alice's room",
      createdBy: alice.id,
    },
  });

  const aliceRoomGame1 = await prisma.games.create({
	data: {
		status: "finished",
		civilianWord: "chat",
		undercoverWord: "tigre",
		roomId: aliceRoom.id
	}
  });

  const aliceRoomGame2 = await prisma.games.create({
	data: {
		status: "waiting",
		civilianWord: "lapin",
		undercoverWord: "cheval",
		roomId: aliceRoom.id
	}
  });

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
