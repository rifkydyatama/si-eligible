console.log('Starting show-admin script')
const { PrismaClient } = require('@prisma/client')
console.log('Prisma client constructor loaded')
const prisma = new PrismaClient()
console.log('Prisma client instantiated')
const email = process.argv[2] || 'admin@gmail.com'
console.log('Querying user:', email)
;(async () => {
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, role: true, password: true } })
    if (!user) {
      console.log(`User not found: ${email}`)
      process.exit(1)
    }
    console.log('User:', JSON.stringify(user, null, 2))
    await prisma.$disconnect()
  } catch (e) {
    console.error('Error:', e)
    process.exit(1)
  }
})()
