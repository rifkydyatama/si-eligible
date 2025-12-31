import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('⚙️ Memulai Inisialisasi Sistem (Production Mode)...')

    // 1. Setup Konfigurasi Dasar Aplikasi
    // Default: Sistem Aktif, Deadline diset 1 bulan dari sekarang
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 30) // +30 hari

    await prisma.appConfig.create({
        data: {
            verificationDeadline: deadline,
            isActive: true,
            announcementDate: null // Belum ada pengumuman
        }
    })
    console.log('✅ System Configuration: READY')

    // 2. Buat Akun SUPER ADMIN (Ini akun kamu!)
    // Ganti data di bawah ini sesuai keinginanmu
    const superAdmin = await prisma.user.create({
        data: {
            name: 'Administrator Utama',
            email: 'admin@gmail.com', // <--- GANTI EMAIL INI
            password: 'admin123',           // <--- GANTI PASSWORD INI (Nanti kita enkripsi)
            role: 'SUPER_ADMIN'
        }
    })

    console.log(`✅ Super Admin Created: ${superAdmin.email}`)
    console.log('🚀 Database siap menerima data asli via Excel Import.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })