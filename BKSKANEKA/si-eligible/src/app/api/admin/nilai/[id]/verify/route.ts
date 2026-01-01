// src/app/api/admin/nilai/[id]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify that the nilai exists
    const nilai = await prisma.nilaiRapor.findUnique({
      where: { id }
    });

    if (!nilai) {
      return NextResponse.json({ error: 'Nilai tidak ditemukan' }, { status: 404 });
    }

    // Update verification status
    const updatedNilai = await prisma.nilaiRapor.update({
      where: { id },
      data: { isVerified: true }
    });

    return NextResponse.json(updatedNilai);
  } catch (error) {
    console.error('Error verifying nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}