// src/app/api/admin/siswa/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

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

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(bytes));

    // Parse Excel dengan ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json({ error: 'Worksheet tidak ditemukan' }, { status: 400 });
    }

    type SiswaData = {
      nisn: string;
      nama: string;
      tanggalLahir: Date;
      kelas: string;
      jurusan: string;
      email: string | null;
      noTelepon: string | null;
      statusKIPK: boolean;
    };

    const siswaData: SiswaData[] = [];
    const errors: string[] = [];

    // Read rows (skip header)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const nisn = row.getCell(1).value?.toString().trim();
      const nama = row.getCell(2).value?.toString().trim();
      const tanggalLahir = row.getCell(3).value;
      const kelas = row.getCell(4).value?.toString().trim();
      const jurusan = row.getCell(5).value?.toString().trim();
      const email = row.getCell(6).value?.toString().trim();
      const noTelepon = row.getCell(7).value?.toString().trim();
      const statusKIPK = row.getCell(8).value?.toString().toLowerCase() === 'ya';

      // Validasi
      if (!nisn || nisn.length !== 10) {
        errors.push(`Baris ${rowNumber}: NISN tidak valid (${nisn})`);
        return;
      }

      if (!nama) {
        errors.push(`Baris ${rowNumber}: Nama tidak boleh kosong`);
        return;
      }

      if (!tanggalLahir) {
        errors.push(`Baris ${rowNumber}: Tanggal lahir tidak boleh kosong`);
        return;
      }

      // Parse tanggal
      let parsedDate: Date;
      if (tanggalLahir instanceof Date) {
        parsedDate = tanggalLahir;
      } else if (typeof tanggalLahir === 'number') {
        // Excel serial date
        parsedDate = new Date((tanggalLahir - 25569) * 86400 * 1000);
      } else {
        parsedDate = new Date(tanggalLahir.toString());
      }

      siswaData.push({
        nisn,
        nama,
        tanggalLahir: parsedDate,
        kelas: kelas || '12',
        jurusan: jurusan || 'IPA',
        email: email || null,
        noTelepon: noTelepon || null,
        statusKIPK
      });
    });

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validasi gagal', 
        errors 
      }, { status: 400 });
    }

    // Bulk insert dengan check duplicate
    let successCount = 0;
    let duplicateCount = 0;

    for (const data of siswaData) {
      try {
        const existing = await prisma.siswa.findUnique({
          where: { nisn: data.nisn }
        });

        if (existing) {
          duplicateCount++;
          continue;
        }

        await prisma.siswa.create({ data });
        successCount++;
      } catch (error) {
        console.error('Error inserting siswa:', error);
        errors.push(`Gagal insert siswa ${data.nama}: ${error}`);
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.userId,
        userType: session.user.role,
        action: 'import_siswa',
        description: `Import ${successCount} siswa dari Excel`,
        metadata: {
          successCount,
          duplicateCount,
          totalRows: siswaData.length
        }
      }
    });

    return NextResponse.json({
      message: 'Import selesai',
      successCount,
      duplicateCount,
      totalRows: siswaData.length,
      errors
    });
  } catch (error) {
    console.error('Error importing siswa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}