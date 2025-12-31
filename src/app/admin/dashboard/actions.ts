"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'
import { calculateRankingAllMajors } from '@/lib/ranking-engine' // Import logic tadi

// singleton Prisma client imported above

export async function importDataSiswa(formData: FormData): Promise<void> {
  const file = formData.get('excelFile') as File
  
  if (!file) {
    console.error('File tidak ditemukan')
    return
  }

  try {
    // 1. Baca File Excel
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    
    // Ambil sheet pertama
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    
    // Konversi ke JSON
    const data = XLSX.utils.sheet_to_json(sheet)
    
    // 2. Loop & Simpan ke Database
    // Format Excel Wajib: NISN | NAMA | JURUSAN | NILAI_MTK | NILAI_INGGRIS | NILAI_INDO
    let successCount = 0
    
    // --- PERBAIKAN DI SINI ---
    // Kita hapus ": any" dan gunakan casting "as any[]" pada datanya
    for (const row of (data as any[])) {
      
      // Validasi data minimal (harus ada NISN & Nama)
      if (!row['NISN'] || !row['NAMA']) continue;

      // Cari atau Bikin Jurusan dulu (kalau belum ada)
      const majorName = row['JURUSAN'] || 'UMUM'
      let major = await prisma.major.findFirst({ where: { name: majorName } })
      
      if (!major) {
        major = await prisma.major.create({ 
            data: { name: majorName, quotaPercentage: 40 } 
        })
      }

      // Hitung Rata-rata simpel
      // Pastikan nama kolom di Excel SAMA PERSIS (Huruf Besar) dengan di sini
      const n1 = Number(row['NILAI_MTK']) || 0
      const n2 = Number(row['NILAI_INGGRIS']) || 0
      const n3 = Number(row['NILAI_INDO']) || 0 
      const avg = (n1 + n2 + n3) / 3

      // Simpan Siswa (Upsert = Update kalau ada, Create kalau belum)
      await prisma.student.upsert({
        where: { nisn: String(row['NISN']) },
        update: { 
            averageScore: avg,
            majorId: major.id 
        },
        create: {
          nisn: String(row['NISN']),
          name: row['NAMA'],
          birthDate: new Date('2006-01-01'), // Default password
          majorId: major.id,
          averageScore: avg,
          dataStatus: 'VERIFIED'
        }
      })
      
      successCount++
      
      // Catat Log (Opsional)
      // Kita bungkus try-catch kecil biar kalau log gagal, import tetap jalan
      try {
        await prisma.auditLog.create({
            data: {
                action: "IMPORT_SISWA",
                details: `Import siswa ${row['NAMA']}`,
                createdAt: new Date()
            }
        })
      } catch(e) { /* Ignore log error */ }
    }

    revalidatePath('/admin/dashboard')
    // success - no return value (form actions used as form handlers expect void)
    return

  } catch (error) {
    console.error(error)
    // error - log and return void
    console.error(error)
    return
  }
}

// Server Action untuk dipanggil tombol
export async function triggerRankingProcess(formData: FormData): Promise<void> {
  try {
    await calculateRankingAllMajors()
    revalidatePath('/admin/dashboard') // Refresh halaman biar angka berubah
    return
  } catch (error) {
    console.error("Ranking Error:", error)
    return
  }
}