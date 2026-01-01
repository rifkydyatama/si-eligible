// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get statistics
    const [totalSiswa, totalNilaiVerified, totalSanggahanPending, totalKelulusan] = await Promise.all([
      prisma.siswa.count(),
      prisma.siswa.count({
        where: {
          nilaiRapor: {
            some: {
              isVerified: true
            }
          }
        }
      }),
      prisma.sanggahan.count({
        where: {
          status: 'pending'
        }
      }),
      prisma.kelulusan.count({
        where: {
          status: 'diterima'
        }
      })
    ]);

    return NextResponse.json({
      totalSiswa,
      totalNilaiVerified,
      totalSanggahanPending,
      totalKelulusan
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}