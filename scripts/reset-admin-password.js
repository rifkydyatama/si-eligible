// Reset admin password script
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const email = process.argv[2] || 'admin@gmail.com'
const newPassword = process.argv[3] || 'admin-reset-123'

;(async () => {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.log(`User not found: ${email}`)
      process.exit(1)
    }

    await prisma.user.update({ where: { email }, data: { password: newPassword } })
    console.log(`Password for ${email} has been set to: ${newPassword}`)
    console.log('Please login and change the password immediately.')
    await prisma.$disconnect()
  } catch (e) {
    console.error('Error:', e)
    process.exit(1)
  }
})()
