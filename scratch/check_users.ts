import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  console.log("Recent users:")
  console.log(users.map(u => ({ email: u.email, name: u.name, createdAt: u.createdAt })))
}
main().finally(() => prisma.$disconnect())
