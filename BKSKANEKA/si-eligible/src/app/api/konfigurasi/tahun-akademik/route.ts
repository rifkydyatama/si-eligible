// src/app/api/admin/konfigurasi/tahun-akademik/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua tahun akademik
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tahunAkademik = await prisma.tahunAkademik.findMany({
      orderBy: {
        tahun: 'desc'
      },
      include: {
        _count: {
          select: {
            periodeJalur: true,
            konfigurasiNilai: true,
            konfigurasiKuota: true
          }
        }
      }
    });

    return NextResponse.json(tahunAkademik);
  } catch (error) {
    console.error('Error fetching tahun akademik:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Tambah tahun akademik baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tahun, tanggalMulai, tanggalSelesai, isActive } = body;

    // Validasi
    if (!tahun || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.tahunAkademik.findUnique({
      where: { tahun }
    });

    if (existing) {
      return NextResponse.json({ error: 'Tahun akademik sudah ada' }, { status: 400 });
    }

    // Jika isActive = true, nonaktifkan tahun akademik lain
    if (isActive) {
      await prisma.tahunAkademik.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const tahunAkademik = await prisma.tahunAkademik.create({
      data: {
        tahun,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        isActive: isActive || false
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.userId,
        userType: session.user.role,
        action: 'create_tahun_akademik',
        description: `Menambahkan tahun akademik: ${tahun}`
      }
    });

    return NextResponse.json(tahunAkademik, { status: 201 });
  } catch (error) {
    console.error('Error creating tahun akademik:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}