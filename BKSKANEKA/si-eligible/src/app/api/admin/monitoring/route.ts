import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get basic counts
    const [totalSiswa, totalKelulusan, totalPeminatan] = await Promise.all([
      prisma.siswa.count(),
      prisma.kelulusan.count(),
      prisma.peminatan.count()
    ]);

    // Get graduation trend by month (last 12 months)
    const kelulusanByMonth = await prisma.$queryRaw<Array<{ month: string; count: number }>>`
      SELECT
        DATE_FORMAT(createdAt, '%M %Y') as month,
        COUNT(*) as count
      FROM Kelulusan
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), DATE_FORMAT(createdAt, '%M %Y')
      ORDER BY MIN(createdAt) DESC
      LIMIT 12
    `;

    // Get distribution by campus type using raw SQL
    const kelulusanByKampusTypeRaw = await prisma.$queryRaw<Array<{ jenisKampus: string; count: number }>>`
      SELECT
        k.jenisKampus,
        COUNT(kl.id) as count
      FROM Kelulusan kl
      JOIN MasterKampus k ON kl.kampusId = k.id
      GROUP BY k.jenisKampus
      ORDER BY count DESC
    `;

    // Get distribution by major using raw SQL
    const kelulusanByJurusanRaw = await prisma.$queryRaw<Array<{ namaJurusan: string; count: number }>>`
      SELECT
        j.namaJurusan,
        COUNT(kl.id) as count
      FROM Kelulusan kl
      JOIN MasterJurusan j ON kl.jurusanId = j.id
      GROUP BY j.namaJurusan
      ORDER BY count DESC
    `;

    // Get top campuses using raw SQL
    const topKampusRaw = await prisma.$queryRaw<Array<{ namaKampus: string; count: number }>>`
      SELECT
        k.namaKampus,
        COUNT(kl.id) as count
      FROM Kelulusan kl
      JOIN MasterKampus k ON kl.kampusId = k.id
      GROUP BY k.namaKampus
      ORDER BY count DESC
      LIMIT 10
    `;

    return NextResponse.json({
      totalSiswa,
      totalKelulusan,
      totalPeminatan,
      kelulusanByMonth,
      kelulusanByKampusType: kelulusanByKampusTypeRaw,
      kelulusanByJurusan: kelulusanByJurusanRaw,
      topKampus: topKampusRaw
    });
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}