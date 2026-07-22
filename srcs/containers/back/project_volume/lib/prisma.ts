import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

export const prisma = new PrismaClient({ 
  adapter,
  log: [{ level: "query", emit: "event" }]
})

prisma.$on("query", (e) => {
  console.log(e)
})