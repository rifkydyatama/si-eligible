// Simple Prisma client implementation
const { PrismaClient } = require('@prisma/client')

let prisma: any

declare global {
  var __prisma: any
}

if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
  } else {
    if (!global.__prisma) {
      global.__prisma = new PrismaClient()
    }
    prisma = global.__prisma
  }
}

export default prisma
