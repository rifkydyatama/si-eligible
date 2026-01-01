// src/app/api/siswa/nilai/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'siswa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const nilai = await prisma.nilaiRapor.findMany({
      where: {
        siswaId: session.user.userId
      },
      orderBy: [
        { semester: 'asc' },
        { mataPelajaran: 'asc' }
      ]
    });

    return NextResponse.json(nilai);
  } catch (error) {
    console.error('Error fetching nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}