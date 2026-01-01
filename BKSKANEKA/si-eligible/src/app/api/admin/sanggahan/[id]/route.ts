// src/app/api/admin/sanggahan/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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
    const { status, keterangan } = await request.json();

    const sanggahan = await prisma.sanggahan.findUnique({
      where: { id },
      include: { siswa: true }
    });

    if (!sanggahan) {
      return NextResponse.json({ error: 'Sanggahan tidak ditemukan' }, { status: 404 });
    }

    // Update sanggahan
    const updated = await prisma.sanggahan.update({
      where: { id },
      data: {
        status,
        keterangan: keterangan || null,
        reviewedBy: session.user.userId,
        reviewedAt: new Date()
      }
    });

    // Jika approved, update nilai di database
    if (status === 'approved') {
      await prisma.nilaiRapor.updateMany({
        where: {
          siswaId: sanggahan.siswaId,
          semester: sanggahan.semester,
          mataPelajaran: sanggahan.mataPelajaran
        },
        data: {
          nilai: sanggahan.nilaiBaru
        }
      });
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.userId,
        userType: session.user.role,
        action: status === 'approved' ? 'approve_sanggahan' : 'reject_sanggahan',
        description: `${status === 'approved' ? 'Menyetujui' : 'Menolak'} sanggahan ${sanggahan.siswa.nama} - ${sanggahan.mataPelajaran}`
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating sanggahan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}