// src/app/api/siswa/sanggahan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'siswa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const nilaiId = formData.get('nilaiId') as string;
    const nilaiBaru = parseFloat(formData.get('nilaiBaru') as string);
    const file = formData.get('file') as File;

    if (!nilaiId || !nilaiBaru || !file) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Verify that the nilai belongs to the current user
    const nilai = await prisma.nilaiRapor.findFirst({
      where: {
        id: nilaiId,
        siswaId: session.user.userId
      }
    });

    if (!nilai) {
      return NextResponse.json({ error: 'Nilai tidak ditemukan' }, { status: 404 });
    }

    // For now, just store the filename. In production, you'd upload to cloud storage
    const buktiRapor = `sanggahan_${Date.now()}_${file.name}`;

    // Create sanggahan record
    const sanggahan = await prisma.sanggahan.create({
      data: {
        siswaId: session.user.userId,
        semester: nilai.semester,
        mataPelajaran: nilai.mataPelajaran,
        nilaiLama: nilai.nilai,
        nilaiBaru,
        buktiRapor,
        status: 'pending'
      }
    });

    return NextResponse.json(sanggahan);
  } catch (error) {
    console.error('Error creating sanggahan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}