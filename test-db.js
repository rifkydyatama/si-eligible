// Test script for Prisma connection
import getPrisma from './src/lib/prisma.ts'

async function testConnection() {
  try {
    console.log('Testing Prisma connection...')
    const prisma = await getPrisma()
    console.log('Prisma client loaded successfully')

    const users = await prisma.user.findMany()
    console.log('Database connection successful, users count:', users.length)

    const students = await prisma.student.findMany({ take: 5 })
    console.log('Students query successful, count:', students.length)

  } catch (error) {
    console.error('Error:', error)
  }
}

testConnection()