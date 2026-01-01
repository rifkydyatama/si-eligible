// src/app/api/admin/nilai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Ambil nilai rapor siswa
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');
    const unverifiedOnly = searchParams.get('unverifiedOnly') === 'true';

    if (siswaId) {
      // Get nilai for specific student
      const nilai = await prisma.nilaiRapor.findMany({
        where: { 
          siswaId,
          ...(unverifiedOnly && { isVerified: false })
        },
        orderBy: [
          { semester: 'asc' },
          { mataPelajaran: 'asc' }
        ],
        include: {
          siswa: {
            select: {
              nama: true,
              nisn: true
            }
          }
        }
      });

      return NextResponse.json(nilai);
    } else {
      // Get all unverified nilai for admin verification
      const nilai = await prisma.nilaiRapor.findMany({
        where: { isVerified: false },
        orderBy: [
          { siswa: { nama: 'asc' } },
          { semester: 'asc' },
          { mataPelajaran: 'asc' }
        ],
        include: {
          siswa: {
            select: {
              nama: true,
              nisn: true
            }
          }
        }
      });

      return NextResponse.json(nilai);
    }
  } catch (error) {
    console.error('Error fetching nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Tambah nilai rapor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siswaId, semester, mataPelajaran, nilai } = body;

    // Validasi
    if (!siswaId || !semester || !mataPelajaran || nilai === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (semester < 1 || semester > 5) {
      return NextResponse.json({ error: 'Semester harus 1-5' }, { status: 400 });
    }

    if (nilai < 0 || nilai > 100) {
      return NextResponse.json({ error: 'Nilai harus 0-100' }, { status: 400 });
    }

    // Check jika nilai sudah ada
    const existing = await prisma.nilaiRapor.findFirst({
      where: {
        siswaId,
        semester,
        mataPelajaran
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Nilai sudah ada, gunakan update' }, { status: 400 });
    }

    const nilaiRapor = await prisma.nilaiRapor.create({
      data: {
        siswaId,
        semester,
        mataPelajaran,
        nilai,
        isVerified: false
      }
    });

    return NextResponse.json(nilaiRapor, { status: 201 });
  } catch (error) {
    console.error('Error creating nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}