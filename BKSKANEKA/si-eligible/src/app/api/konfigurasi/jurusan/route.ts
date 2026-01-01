import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const jurusan = await prisma.masterJurusan.findMany({
      where: {
        isActive: true
      },
      include: {
        kampus: {
          select: {
            id: true,
            namaKampus: true,
            jenisKampus: true,
            provinsi: true,
            kota: true
          }
        }
      },
      orderBy: {
        namaJurusan: 'asc'
      }
    });

    return NextResponse.json(jurusan);
  } catch (error) {
    console.error('Error fetching jurusan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}