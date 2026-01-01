// src/app/api/admin/export/route.ts
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

    const { jalur, format } = await request.json();

    // Get siswa data with nilai
    const siswaList = await prisma.siswa.findMany({
      where: {
        nilaiRapor: {
          some: {
            isVerified: true
          }
        }
      },
      include: {
        nilaiRapor: {
          where: { isVerified: true },
          orderBy: [
            { semester: 'asc' },
            { mataPelajaran: 'asc' }
          ]
        },
        peminatan: {
          where: { jalur },
          include: {
            kampus: true,
            jurusan: true
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Siswa');

    // Define columns based on format
    if (format === 'pdss_snpmb') {
      worksheet.columns = [
        { header: 'NISN', key: 'nisn', width: 15 },
        { header: 'Nama Lengkap', key: 'nama', width: 30 },
        { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 15 },
        { header: 'Kelas', key: 'kelas', width: 10 },
        { header: 'Jurusan', key: 'jurusan', width: 10 },
        { header: 'Rata-rata Nilai', key: 'rataRata', width: 15 },
        { header: 'Pilihan 1', key: 'pilihan1', width: 40 },
        { header: 'Pilihan 2', key: 'pilihan2', width: 40 }
      ];
    } else if (format === 'span_ptkin') {
      worksheet.columns = [
        { header: 'NISN', key: 'nisn', width: 15 },
        { header: 'Nama', key: 'nama', width: 30 },
        { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 15 },
        { header: 'Kelas', key: 'kelas', width: 10 },
        { header: 'Nilai Rata-rata', key: 'rataRata', width: 15 },
        { header: 'Kampus Tujuan', key: 'kampus', width: 30 },
        { header: 'Program Studi', key: 'prodi', width: 30 }
      ];
    } else if (format === 'internal') {
      worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'NISN', key: 'nisn', width: 15 },
        { header: 'Nama', key: 'nama', width: 30 },
        { header: 'Kelas', key: 'kelas', width: 10 },
        { header: 'Jurusan', key: 'jurusan', width: 10 },
        { header: 'Rata-rata Semester 1-5', key: 'rataRata', width: 20 },
        { header: 'Ranking', key: 'ranking', width: 10 },
        { header: 'Status KIP-K', key: 'kipk', width: 12 },
        { header: 'Pilihan 1', key: 'pilihan1', width: 40 },
        { header: 'Pilihan 2', key: 'pilihan2', width: 40 }
      ];
    } else {
      // CSV format
      worksheet.columns = [
        { header: 'NISN', key: 'nisn', width: 15 },
        { header: 'Nama', key: 'nama', width: 30 },
        { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 15 },
        { header: 'Kelas', key: 'kelas', width: 10 },
        { header: 'Jurusan', key: 'jurusan', width: 10 }
      ];
    }

    // Add data rows
    let rowNumber = 1;
    for (const siswa of siswaList) {
      // Calculate rata-rata nilai
      const totalNilai = siswa.nilaiRapor.reduce((sum, n) => sum + n.nilai, 0);
      const rataRata = siswa.nilaiRapor.length > 0 
        ? (totalNilai / siswa.nilaiRapor.length).toFixed(2) 
        : '0.00';

      const peminatan1 = siswa.peminatan.find(p => p.pilihan === 1);
      const peminatan2 = siswa.peminatan.find(p => p.pilihan === 2);

      const rowData: any = {
        no: rowNumber++,
        nisn: siswa.nisn,
        nama: siswa.nama,
        tanggalLahir: siswa.tanggalLahir.toISOString().split('T')[0],
        kelas: siswa.kelas,
        jurusan: siswa.jurusan,
        rataRata,
        ranking: '-', // TODO: Implement ranking logic
        kipk: siswa.statusKIPK ? 'Ya' : 'Tidak',
        pilihan1: peminatan1 
          ? `${peminatan1.kampus.namaKampus} - ${peminatan1.jurusan.namaJurusan}`
          : '-',
        pilihan2: peminatan2 
          ? `${peminatan2.kampus.namaKampus} - ${peminatan2.jurusan.namaJurusan}`
          : '-',
        kampus: peminatan1?.kampus.namaKampus || '-',
        prodi: peminatan1?.jurusan.namaJurusan || '-'
      };

      worksheet.addRow(rowData);
    }

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.userId,
        userType: session.user.role,
        action: 'export_data',
        description: `Export data ${jalur} format ${format}`,
        metadata: {
          jalur,
          format,
          totalSiswa: siswaList.length
        }
      }
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="export_${jalur}_${format}_${Date.now()}.xlsx"`
      }
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}