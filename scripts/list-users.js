// simple script to list users using @prisma/client directly
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
;(async () => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, password: true } })
    console.log(JSON.stringify(users, null, 2))
    await prisma.$disconnect()
  } catch (e) {
    console.error('Error listing users:', e)
    process.exit(1)
  }
})()
