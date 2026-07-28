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
	where: { name: "alice's room" },
	update: {},
    create: {
      name: "alice's room",
      created_by: alice.id,
    },
  });

  const aliceRoomGame1 = await prisma.games.create({
	data: {
		status: "finished",
		civilian_word: "chat",
		undercover_word: "tigre",
		room_id: aliceRoom.id
	}
  });

  const aliceRoomGame2 = await prisma.games.create({
	data: {
		status: "waiting",
		civilian_word: "lapin",
		undercover_word: "cheval",
		room_id: aliceRoom.id
	}
  });

  const aliceGamePlayer_1 = await prisma.game_Players.create({
	data: {
		role: "undercover",
		game_id: aliceRoomGame1.id,
		player_id: alice.id
	}
  })

  const bobGamePlayer_1 = await prisma.game_Players.create({
	data: {
		role: "civilian",
		game_id: aliceRoomGame1.id,
		player_id: bob.id
	}
  })

  const marleyGamePlayer_1 = await prisma.game_Players.create({
	data: {
		role: "civilian",
		game_id: aliceRoomGame1.id,
		player_id: marley.id
	}
  })

  const wp_1 = await prisma.word_Pair.create({
	data: {
		civilian_word: "lapin",
		undercover_word: "cheval"
	}
  })

  const wp_2 = await prisma.word_Pair.create({
	data: {
		civilian_word: "chat",
		undercover_word: "tigre"
	}
  })

  const wp_3 = await prisma.word_Pair.create({
	data: {
		civilian_word: "telephone",
		undercover_word: "ordinateur"
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
