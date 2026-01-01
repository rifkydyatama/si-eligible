// src/app/api/admin/kampus/[id]/jurusan/[jurusanId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jurusanId: string }> }
) {
  try {
    const { id, jurusanId } = await params;
    // Check if jurusan exists and belongs to the kampus
    const jurusan = await prisma.masterJurusan.findFirst({
      where: {
        id: jurusanId,
        kampusId: id
      }
    });

    if (!jurusan) {
      return NextResponse.json({ error: 'Program studi tidak ditemukan' }, { status: 404 });
    }

    // Check if jurusan is being used in peminatan or kelulusan
    const peminatanCount = await prisma.peminatan.count({
      where: { jurusanId: jurusanId }
    });

    const kelulusanCount = await prisma.kelulusan.count({
      where: { jurusanId: jurusanId }
    });

    if (peminatanCount > 0 || kelulusanCount > 0) {
      return NextResponse.json({
        error: 'Program studi tidak dapat dihapus karena masih digunakan dalam data peminatan atau kelulusan'
      }, { status: 400 });
    }

    // Delete jurusan
    await prisma.masterJurusan.delete({
      where: { id: jurusanId }
    });

    return NextResponse.json({ message: 'Program studi berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting jurusan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}