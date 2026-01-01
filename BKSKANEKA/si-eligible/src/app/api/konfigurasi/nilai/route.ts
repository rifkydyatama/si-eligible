// src/app/api/admin/konfigurasi/nilai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tahunAkademikId,
      kurikulum,
      jalur,
      bobotSemester1,
      bobotSemester2,
      bobotSemester3,
      bobotSemester4,
      bobotSemester5,
      mataPelajaranWajib,
      mataPelajaranPeminatan,
      formulaPerhitungan,
      customFormula
    } = body;

    // Validasi total bobot = 1
    const totalBobot = 
      parseFloat(bobotSemester1) +
      parseFloat(bobotSemester2) +
      parseFloat(bobotSemester3) +
      parseFloat(bobotSemester4) +
      parseFloat(bobotSemester5);

    if (Math.abs(totalBobot - 1.0) > 0.001) {
      return NextResponse.json(
        { error: `Total bobot harus = 1.0 (sekarang: ${totalBobot})` },
        { status: 400 }
      );
    }

    // Upsert konfigurasi
    const konfigurasi = await prisma.konfigurasiNilai.upsert({
      where: {
        tahunAkademikId_kurikulum_jalur: {
          tahunAkademikId,
          kurikulum,
          jalur
        }
      },
      update: {
        bobotSemester1: parseFloat(bobotSemester1),
        bobotSemester2: parseFloat(bobotSemester2),
        bobotSemester3: parseFloat(bobotSemester3),
        bobotSemester4: parseFloat(bobotSemester4),
        bobotSemester5: parseFloat(bobotSemester5),
        mataPelajaranWajib,
        mataPelajaranPeminatan,
        formulaPerhitungan,
        customFormula: customFormula || null
      },
      create: {
        tahunAkademikId,
        kurikulum,
        jalur,
        bobotSemester1: parseFloat(bobotSemester1),
        bobotSemester2: parseFloat(bobotSemester2),
        bobotSemester3: parseFloat(bobotSemester3),
        bobotSemester4: parseFloat(bobotSemester4),
        bobotSemester5: parseFloat(bobotSemester5),
        mataPelajaranWajib,
        mataPelajaranPeminatan,
        formulaPerhitungan,
        customFormula: customFormula || null
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.userId,
        userType: session.user.role,
        action: 'update_konfigurasi_nilai',
        description: `Update konfigurasi nilai: ${kurikulum} - ${jalur}`
      }
    });

    return NextResponse.json(konfigurasi);
  } catch (error) {
    console.error('Error saving konfigurasi nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}