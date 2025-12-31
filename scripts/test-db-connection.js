// Test database connection
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Test query
    const userCount = await prisma.user.count()
    console.log(`📊 Users in database: ${userCount}`)

    await prisma.$disconnect()
    console.log('✅ Database connection closed')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()