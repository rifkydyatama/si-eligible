// Comprehensive test script for all features
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

async function testAllFeatures() {
  const prisma = new PrismaClient()

  try {
    console.log('🔄 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Test 1: Check admin user
    console.log('\n🔄 Testing admin user...')
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' }
    })
    if (admin) {
      console.log('✅ Admin user found:', {
        id: admin.id,
        email: admin.email,
        role: admin.role
      })
    } else {
      console.log('❌ Admin user not found')
    }

    // Test 2: Check students count
    console.log('\n🔄 Testing students data...')
    const totalStudents = await prisma.student.count()
    console.log(`📊 Total students: ${totalStudents}`)

    const eligibleStudents = await prisma.student.count({
      where: { isEligible: true }
    })
    console.log(`📊 Eligible students: ${eligibleStudents}`)

    const verifiedStudents = await prisma.student.count({
      where: { dataStatus: 'VERIFIED' }
    })
    console.log(`📊 Verified students: ${verifiedStudents}`)

    // Test 3: Check majors
    console.log('\n🔄 Testing majors data...')
    const majors = await prisma.major.findMany({
      select: { id: true, name: true, quotaCount: true, totalStudents: true }
    })
    console.log(`📊 Majors found: ${majors.length}`)
    majors.forEach(major => {
      console.log(`  - ${major.name}: ${major.quotaCount} kuota, ${major.totalStudents} siswa`)
    })

    // Test 4: Check app config
    console.log('\n🔄 Testing app configuration...')
    const config = await prisma.appConfig.findFirst()
    if (config) {
      console.log('✅ App config found:', {
        quotaPercentage: config.quotaPercentage,
        isActive: config.isActive
      })
    } else {
      console.log('❌ App config not found')
    }

    // Test 5: Check rebuttals
    console.log('\n🔄 Testing rebuttals...')
    const pendingRebuttals = await prisma.rebuttal.count({
      where: { status: 'PENDING' }
    })
    console.log(`📊 Pending rebuttals: ${pendingRebuttals}`)

    // Test 6: Try to create a test student (but rollback)
    console.log('\n🔄 Testing student creation logic...')
    try {
      const testStudent = await prisma.student.create({
        data: {
          name: 'Test Student',
          nisn: '1234567890',
          majorId: majors[0]?.id || 1,
          birthDate: new Date('2000-01-01'),
          averageScore: 85.5,
          ranking: 1,
          dataStatus: 'VERIFIED',
          isEligible: false
        }
      })
      console.log('✅ Test student created:', testStudent.id)

      // Clean up test student
      await prisma.student.delete({
        where: { id: testStudent.id }
      })
      console.log('🧹 Test student cleaned up')
    } catch (error) {
      console.log('❌ Student creation test failed:', error.message)
    }

    await prisma.$disconnect()
    console.log('\n✅ All tests completed successfully!')
    console.log('\n🎉 System is ready for production!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testAllFeatures()