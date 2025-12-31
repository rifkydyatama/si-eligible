// Seed initial data for testing
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

async function seedInitialData() {
  const prisma = new PrismaClient()

  try {
    console.log('🔄 Seeding initial data...')
    await prisma.$connect()

    // Create majors
    console.log('📚 Creating majors...')
    const majors = [
      { name: 'Teknik Komputer dan Jaringan', quotaCount: 30, totalStudents: 45 },
      { name: 'Multimedia', quotaCount: 25, totalStudents: 38 },
      { name: 'Akuntansi', quotaCount: 35, totalStudents: 52 },
      { name: 'Administrasi Perkantoran', quotaCount: 28, totalStudents: 41 },
      { name: 'Pemasaran', quotaCount: 22, totalStudents: 33 }
    ]

    const createdMajors = []
    for (const majorData of majors) {
      // Check if major already exists
      let major = await prisma.major.findFirst({
        where: { name: majorData.name }
      })

      if (!major) {
        major = await prisma.major.create({
          data: majorData
        })
        console.log(`✅ Created major: ${major.name}`)
      } else {
        console.log(`ℹ️ Major already exists: ${major.name}`)
      }
      createdMajors.push(major)
    }

    // Create sample students
    console.log('\n👨‍🎓 Creating sample students...')
    const sampleStudents = [
      { name: 'Ahmad Fauzi', nisn: '1234567891', majorId: createdMajors[0].id, averageScore: 87.5, ranking: 1 },
      { name: 'Siti Nurhaliza', nisn: '1234567892', majorId: createdMajors[1].id, averageScore: 89.2, ranking: 2 },
      { name: 'Budi Santoso', nisn: '1234567893', majorId: createdMajors[2].id, averageScore: 85.8, ranking: 3 },
      { name: 'Maya Sari', nisn: '1234567894', majorId: createdMajors[3].id, averageScore: 88.1, ranking: 4 },
      { name: 'Rizki Pratama', nisn: '1234567895', majorId: createdMajors[4].id, averageScore: 86.3, ranking: 5 },
      { name: 'Dewi Lestari', nisn: '1234567896', majorId: createdMajors[0].id, averageScore: 84.7, ranking: 6 },
      { name: 'Eko Susanto', nisn: '1234567897', majorId: createdMajors[1].id, averageScore: 87.9, ranking: 7 },
      { name: 'Fitriani', nisn: '1234567898', majorId: createdMajors[2].id, averageScore: 88.5, ranking: 8 }
    ]

    for (const studentData of sampleStudents) {
      const student = await prisma.student.upsert({
        where: { nisn: studentData.nisn },
        update: studentData,
        create: {
          ...studentData,
          birthDate: new Date('2005-05-15'), // Default birth date
          dataStatus: 'VERIFIED',
          isEligible: Math.random() > 0.5 // Random eligibility for testing
        }
      })
      console.log(`✅ Created student: ${student.name}`)
    }

    // Calculate eligibility based on ranking and quota
    console.log('\n🎯 Calculating eligibility...')
    for (const major of createdMajors) {
      const studentsInMajor = await prisma.student.findMany({
        where: { majorId: major.id },
        orderBy: { ranking: 'asc' }
      })

      const eligibleCount = Math.floor((major.quotaCount / major.totalStudents) * studentsInMajor.length)

      for (let i = 0; i < studentsInMajor.length; i++) {
        const isEligible = i < eligibleCount
        await prisma.student.update({
          where: { id: studentsInMajor[i].id },
          data: { isEligible }
        })
      }
      console.log(`✅ Updated eligibility for ${major.name}: ${eligibleCount} eligible students`)
    }

    // Create sample rebuttal
    console.log('\n📝 Creating sample rebuttal...')
    const studentWithRebuttal = await prisma.student.findFirst()
    if (studentWithRebuttal) {
      await prisma.rebuttal.upsert({
        where: { id: 1 },
        update: {
          description: 'Saya keberatan dengan nilai rapor saya',
          proofUrl: '/uploads/proof.pdf',
          claimedScore: 92.5,
          status: 'PENDING'
        },
        create: {
          studentId: studentWithRebuttal.id,
          description: 'Saya keberatan dengan nilai rapor saya',
          proofUrl: '/uploads/proof.pdf',
          claimedScore: 92.5,
          status: 'PENDING'
        }
      })
      console.log('✅ Created sample rebuttal')
    }

    await prisma.$disconnect()
    console.log('\n🎉 Initial data seeded successfully!')
    console.log('\n📊 Summary:')
    console.log('- 5 majors created')
    console.log('- 8 sample students created')
    console.log('- Eligibility calculated')
    console.log('- 1 sample rebuttal created')

  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

seedInitialData()