import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kampus = await prisma.masterKampus.findMany({
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
        logoUrl: true,
        isActive: true,
        tahunUpdate: true,
        _count: {
          select: {
            jurusan: true,
            peminatan: true,
            kelulusan: true
          }
        }
      },
      orderBy: {
        namaKampus: 'asc'
      }
    });

    // Transform the data to include counts in a flatter structure
    const transformedKampus = kampus.map(k => ({
      ...k,
      jurusanCount: k._count.jurusan,
      peminatanCount: k._count.peminatan,
      kelulusanCount: k._count.kelulusan,
      _count: undefined // Remove the _count object
    }));

    return NextResponse.json(transformedKampus);
  } catch (error) {
    console.error('Error fetching kampus:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      kodeKampus,
      namaKampus,
      jenisKampus,
      kategoriJalur,
      akreditasi,
      provinsi,
      kota,
      website,
      logoUrl
    } = await request.json();

    // Validate required fields
    if (!kodeKampus || !namaKampus || !jenisKampus || !kategoriJalur || !provinsi || !kota) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if kodeKampus already exists
    const existingKampus = await prisma.masterKampus.findUnique({
      where: { kodeKampus }
    });

    if (existingKampus) {
      return NextResponse.json({ error: 'Kode kampus sudah digunakan' }, { status: 400 });
    }

    // Create new kampus
    const newKampus = await prisma.masterKampus.create({
      data: {
        kodeKampus,
        namaKampus,
        jenisKampus,
        kategoriJalur,
        akreditasi: akreditasi || null,
        provinsi,
        kota,
        website: website || null,
        logoUrl: logoUrl || null,
        tahunUpdate: new Date().getFullYear().toString()
      }
    });

    return NextResponse.json(newKampus, { status: 201 });
  } catch (error) {
    console.error('Error creating kampus:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}