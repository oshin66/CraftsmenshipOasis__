import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing OtpVerification table access...')
    const testEmail = 'test-' + Date.now() + '@example.com'
    const expires = new Date(Date.now() + 60000)
    
    await prisma.otpVerification.upsert({
      where: { email: testEmail },
      update: { otp: '123456', expiresAt: expires },
      create: { email: testEmail, otp: '123456', expiresAt: expires },
    })
    
    console.log('SUCCESS: Table is accessible and writable.')
    
    await prisma.otpVerification.delete({ where: { email: testEmail } })
    console.log('SUCCESS: Cleanup complete.')
  } catch (e: any) {
    console.error('FAILURE:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
