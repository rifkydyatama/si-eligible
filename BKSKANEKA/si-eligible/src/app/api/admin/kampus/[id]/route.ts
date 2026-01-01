// src/app/api/admin/kampus/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kampus = await prisma.masterKampus.findUnique({
      where: { id: id },
      include: {
        jurusan: {
          orderBy: { namaJurusan: 'asc' }
        }
      }
    });

    if (!kampus) {
      return NextResponse.json({ error: 'Kampus tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(kampus);
  } catch (error) {
    console.error('Error fetching kampus:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}