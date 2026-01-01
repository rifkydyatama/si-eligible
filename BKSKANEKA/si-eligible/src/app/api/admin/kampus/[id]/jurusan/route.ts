// src/app/api/admin/kampus/[id]/jurusan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { kodeJurusan, namaJurusan, jenjang, fakultas, akreditasi, deskripsi, isActive, tahunUpdate } = body;

    // Validate required fields
    if (!kodeJurusan || !namaJurusan || !jenjang || !fakultas) {
      return NextResponse.json({ error: 'Kode jurusan, nama jurusan, jenjang, dan fakultas wajib diisi' }, { status: 400 });
    }

    // Check if kampus exists
    const kampus = await prisma.masterKampus.findUnique({
      where: { id: id }
    });

    if (!kampus) {
      return NextResponse.json({ error: 'Kampus tidak ditemukan' }, { status: 404 });
    }

    // Check if kodeJurusan is unique for this kampus
    const existingJurusan = await prisma.masterJurusan.findUnique({
      where: {
        kampusId_kodeJurusan: {
          kampusId: id,
          kodeJurusan: kodeJurusan
        }
      }
    });

    if (existingJurusan) {
      return NextResponse.json({ error: 'Kode program studi sudah digunakan di kampus ini' }, { status: 400 });
    }

    // Create jurusan
    const jurusan = await prisma.masterJurusan.create({
      data: {
        kampusId: id,
        kodeJurusan,
        namaJurusan,
        jenjang,
        fakultas,
        akreditasi: akreditasi || null,
        deskripsi: deskripsi || null,
        isActive: isActive !== undefined ? isActive : true,
        tahunUpdate: tahunUpdate || new Date().getFullYear().toString()
      }
    });

    return NextResponse.json(jurusan, { status: 201 });
  } catch (error) {
    console.error('Error creating jurusan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}