// src/app/api/admin/nilai/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { Buffer } from 'buffer'; // Ensure Node.js Buffer is used

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer)); // Ensure compatibility with ExcelJS

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json({ error: 'Worksheet tidak ditemukan' }, { status: 400 });
    }

    type NilaiData = {
      nisn: string;
      semester: number;
      mataPelajaran: string;
      nilai: number;
    };

    const nilaiData: NilaiData[] = [];
    const errors: string[] = [];

    // Format Excel yang diharapkan:
    // Kolom: NISN | Semester | Mata Pelajaran | Nilai
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const nisn = row.getCell(1).value?.toString().trim();
      const semester = parseInt(row.getCell(2).value?.toString() || '0');
      const mataPelajaran = row.getCell(3).value?.toString().trim();
      const nilai = parseFloat(row.getCell(4).value?.toString() || '0');

      if (!nisn) {
        errors.push(`Baris ${rowNumber}: NISN tidak boleh kosong`);
        return;
      }

      if (semester < 1 || semester > 5) {
        errors.push(`Baris ${rowNumber}: Semester harus 1-5`);
        return;
      }

      if (!mataPelajaran) {
        errors.push(`Baris ${rowNumber}: Mata pelajaran tidak boleh kosong`);
        return;
      }

      if (nilai < 0 || nilai > 100) {
        errors.push(`Baris ${rowNumber}: Nilai harus 0-100`);
        return;
      }

      nilaiData.push({
        nisn,
        semester,
        mataPelajaran,
        nilai
      });
    });

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validasi gagal', 
        errors 
      }, { status: 400 });
    }

    // Resolve NISN to siswaId
    let successCount = 0;
    let notFoundCount = 0;

    for (const data of nilaiData) {
      try {
        const siswa = await prisma.siswa.findUnique({
          where: { nisn: data.nisn }
        });

        if (!siswa) {
          notFoundCount++;
          errors.push(`NISN ${data.nisn} tidak ditemukan`);
          continue;
        }

        // Upsert nilai
        await prisma.nilaiRapor.upsert({
          where: {
            siswaId_semester_mataPelajaran: {
              siswaId: siswa.id,
              semester: data.semester,
              mataPelajaran: data.mataPelajaran
            }
          },
          update: {
            nilai: data.nilai
          },
          create: {
            siswaId: siswa.id,
            semester: data.semester,
            mataPelajaran: data.mataPelajaran,
            nilai: data.nilai,
            isVerified: false
          }
        });

        successCount++;
      } catch (error) {
        console.error('Error inserting nilai:', error);
        errors.push(`Gagal insert nilai ${data.nisn} - ${data.mataPelajaran}: ${error}`);
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.userId,
        userType: session.user.role,
        action: 'import_nilai',
        description: `Import ${successCount} nilai dari Excel`,
        metadata: {
          successCount,
          notFoundCount,
          totalRows: nilaiData.length
        }
      }
    });

    return NextResponse.json({
      message: 'Import selesai',
      successCount,
      notFoundCount,
      totalRows: nilaiData.length,
      errors
    });
  } catch (error) {
    console.error('Error importing nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}