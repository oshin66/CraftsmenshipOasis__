const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const latestToken = await prisma.passwordResetToken.findFirst({
    orderBy: { createdAt: 'desc' }
  })
  
  if (latestToken) {
    console.log(`Email: ${latestToken.email}`)
    console.log(`Reset Link: http://localhost:3000/reset-password?token=${latestToken.token}`)
  } else {
    console.log("No reset tokens found in the database. Please try requesting one again.")
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
