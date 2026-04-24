const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.update({
    where: { email: 'ujjwal1@co.in' },
    data: { name: 'Ujjwal' }
  })
  console.log(`Updated user: ${user.name} (${user.email})`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
