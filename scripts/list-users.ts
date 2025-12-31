import getPrisma from '../src/lib/prisma.ts'

async function main() {
  const prisma = await getPrisma()
  console.log('Querying users...')
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, password: true } })
  console.log('Users:', JSON.stringify(users, null, 2))
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })