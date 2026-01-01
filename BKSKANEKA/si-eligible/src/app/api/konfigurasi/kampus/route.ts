import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const kampus = await prisma.masterKampus.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        kodeKampus: true,
        namaKampus: true,
        jenisKampus: true,
        kategoriJalur: true,
        akreditasi: true,
        provinsi: true,
        kota: true,
        website: true,
        logoUrl: true
      },
      orderBy: {
        namaKampus: 'asc'
      }
    });

    return NextResponse.json(kampus);
  } catch (error) {
    console.error('Error fetching kampus:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}