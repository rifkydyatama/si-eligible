import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      nama: 'Administrator',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
    },
  });

  // Seed siswa demo
  await prisma.siswa.upsert({
    where: { nisn: '0012345678' },
    update: {},
    create: {
      nisn: '0012345678',
      nama: 'Siswa Demo',
      tanggalLahir: new Date('2007-05-15'),
      kelas: '12',
      jurusan: 'IPA',
      email: 'siswa@example.com',
      noTelepon: '08123456789',
      statusKIPK: false,
      isDataLocked: false,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });