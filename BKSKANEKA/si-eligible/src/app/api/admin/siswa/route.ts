// src/app/api/admin/siswa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua siswa
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const siswa = await prisma.siswa.findMany({
      orderBy: {
        nama: 'asc'
      },
      include: {
        _count: {
          select: {
            nilaiRapor: true
          }
        }
      }
    });

    return NextResponse.json(siswa);
  } catch (error) {
    console.error('Error fetching siswa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Tambah siswa baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nisn, nama, tanggalLahir, kelas, jurusan, email, noTelepon, statusKIPK } = body;

    // Validasi NISN
    if (!nisn || nisn.length !== 10) {
      return NextResponse.json({ error: 'NISN harus 10 digit' }, { status: 400 });
    }

    // Check jika NISN sudah ada
    const existing = await prisma.siswa.findUnique({
      where: { nisn }
    });

    if (existing) {
      return NextResponse.json({ error: 'NISN sudah terdaftar' }, { status: 400 });
    }

    // Buat siswa baru
    const siswa = await prisma.siswa.create({
      data: {
        nisn,
        nama,
        tanggalLahir: new Date(tanggalLahir),
        kelas,
        jurusan,
        email: email || null,
        noTelepon: noTelepon || null,
        statusKIPK: statusKIPK || false
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.userId,
        userType: session.user.role,
        action: 'create_siswa',
        description: `Menambahkan siswa baru: ${nama} (${nisn})`
      }
    });

    return NextResponse.json(siswa, { status: 201 });
  } catch (error) {
    console.error('Error creating siswa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}