// src/app/api/admin/siswa/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Ambil detail siswa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const siswa = await prisma.siswa.findUnique({
      where: { id },
      include: {
        nilaiRapor: {
          orderBy: [
            { semester: 'asc' },
            { mataPelajaran: 'asc' }
          ]
        },
        peminatan: {
          include: {
            kampus: true,
            jurusan: true
          }
        },
        sanggahan: true,
        kelulusan: {
          include: {
            kampus: true,
            jurusan: true
          }
        }
      }
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(siswa);
  } catch (error) {
    console.error('Error fetching siswa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update siswa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nama, tanggalLahir, kelas, jurusan, email, noTelepon, statusKIPK } = body;

    const siswa = await prisma.siswa.update({
      where: { id },
      data: {
        nama,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : undefined,
        kelas,
        jurusan,
        email: email || null,
        noTelepon: noTelepon || null,
        statusKIPK
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.userId,
        userType: session.user.role,
        action: 'update_siswa',
        description: `Mengupdate data siswa: ${siswa.nama} (${siswa.nisn})`
      }
    });

    return NextResponse.json(siswa);
  } catch (error) {
    console.error('Error updating siswa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Hapus siswa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const siswa = await prisma.siswa.findUnique({
      where: { id }
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    await prisma.siswa.delete({
      where: { id }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.userId,
        userType: session.user.role,
        action: 'delete_siswa',
        description: `Menghapus siswa: ${siswa.nama} (${siswa.nisn})`
      }
    });

    return NextResponse.json({ message: 'Siswa berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting siswa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}