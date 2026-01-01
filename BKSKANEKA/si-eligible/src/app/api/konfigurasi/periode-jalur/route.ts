// src/app/api/admin/konfigurasi/periode-jalur/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua periode jalur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tahunAkademikId = searchParams.get('tahunAkademikId');

    const periodeJalur = await prisma.periodeJalur.findMany({
      where: tahunAkademikId ? { tahunAkademikId } : undefined,
      include: {
        tahunAkademik: true
      },
      orderBy: {
        tanggalBukaPendaftaran: 'asc'
      }
    });

    return NextResponse.json(periodeJalur);
  } catch (error) {
    console.error('Error fetching periode jalur:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Tambah periode jalur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tahunAkademikId,
      jalur,
      namaJalur,
      tanggalBukaPendaftaran,
      tanggalTutupPendaftaran,
      tanggalPengumuman,
      kuotaNasional,
      minimalRataRata
    } = body;

    const periodeJalur = await prisma.periodeJalur.create({
      data: {
        tahunAkademikId,
        jalur,
        namaJalur,
        tanggalBukaPendaftaran: new Date(tanggalBukaPendaftaran),
        tanggalTutupPendaftaran: new Date(tanggalTutupPendaftaran),
        tanggalPengumuman: new Date(tanggalPengumuman),
        kuotaNasional: kuotaNasional ? parseInt(kuotaNasional) : null,
        minimalRataRata: minimalRataRata ? parseFloat(minimalRataRata) : null
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.userId,
        userType: session.user.role,
        action: 'create_periode_jalur',
        description: `Menambahkan periode jalur: ${namaJalur}`
      }
    });

    return NextResponse.json(periodeJalur, { status: 201 });
  } catch (error) {
    console.error('Error creating periode jalur:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}