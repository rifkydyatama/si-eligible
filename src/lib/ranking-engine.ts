import prisma from './prisma'

/**
 * FUNGSI UTAMA: GENERATE RANKING
 * Ini akan dijalankan saat Admin klik tombol "Hitung Ranking"
 */
export async function calculateRankingAllMajors() {
  console.log("⚙️ Memulai Kalkulasi Ranking Cerdas...")

  // 1. Ambil Config Kuota (Misal 40%)
  const config = await prisma.appConfig.findFirst()
  const quotaPercent = config?.quotaPercentage || 40

  // 2. Ambil Semua Jurusan
  const majors = await prisma.major.findMany({
    include: { students: true } // Kita butuh hitung total siswa per jurusan
  })

  // 3. Loop per Jurusan (Ranking dipisah per jurusan)
  for (const major of majors) {
    console.log(`\n📊 Memproses Jurusan: ${major.name}`)
    
    // Hitung berapa siswa yang berhak masuk kuota (Eligible)
    // Rumus: Total Siswa * 40%
    const totalSiswa = await prisma.student.count({ where: { majorId: major.id } })
    const quotaCount = Math.floor((totalSiswa * quotaPercent) / 100)
    
    // Update info kuota di tabel Major (biar admin tau)
    await prisma.major.update({
      where: { id: major.id },
      data: { totalStudents: totalSiswa, quotaCount: quotaCount }
    })

    // 4. AMBIL DATA SISWA + NILAI LENGKAP
    // Kita butuh nilai detail untuk Tie-Breaker (jika rata-rata sama)
    const students = await prisma.student.findMany({
      where: { majorId: major.id },
      include: {
        grades: {
          include: { subject: true } // Ambil nama mapel & status prioritas
        }
      }
    })

    // 5. ALGORITMA SORTING (INTI DARI SEGALA INTI)
    // Logic: Bandingkan Rata-rata -> Jika sama, Bandingkan Mapel Prioritas -> Jika sama, Bandingkan Umur/Random
    const rankedStudents = students.sort((a: any, b: any) => {
      // A. Bandingkan Rata-rata (Average Score)
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore // Descending (Gede ke Kecil)
      }

      // B. TIE-BREAKER: Cek Mapel Prioritas (Jika rata-rata SAMA PERSIS)
      // Kita cari total nilai mapel prioritas (biasanya MTK + B.Inggris + Kejuruan)
      const priorityScoreA = getPriorityScore(a.grades)
      const priorityScoreB = getPriorityScore(b.grades)

      if (priorityScoreB !== priorityScoreA) {
        console.log(`   ⚔️ Duel Tie-Breaker: ${a.name} vs ${b.name} (Avg sama: ${a.averageScore}) -> Menang: ${priorityScoreA > priorityScoreB ? a.name : b.name}`)
        return priorityScoreB - priorityScoreA
      }

      return 0 // Kalau masih sama juga, ya nasib (biasanya diurutkan nama/umur)
    })

    // 6. SIMPAN HASIL KE DATABASE (Bulk Update)
    // Kita lakukan transaksi database biar aman
    const updates = rankedStudents.map((student: any, index: number) => {
      const rank = index + 1
      const isEligible = rank <= quotaCount // Tentukan status hijau/merah

      return prisma.student.update({
        where: { id: student.id },
        data: {
          ranking: rank,
          isEligible: isEligible
        }
      })
    })

    // Jalankan semua update sekaligus (Promise.all)
    await prisma.$transaction(updates)
    console.log(`✅ Selesai Jurusan ${major.name}. Kuota: ${quotaCount}, Total: ${totalSiswa}`)
  }

  return { success: true, message: "Perangkingan Selesai!" }
}

/**
 * HELPER: Hitung Total Nilai Mapel Prioritas
 * Digunakan saat nilai rata-rata siswa sama.
 */
function getPriorityScore(grades: any[]) {
  // Filter hanya mapel yang isPriority = true (Set di database)
  const priorityGrades = grades.filter(g => g.subject.isPriority)
  
  // Jumlahkan nilainya
  return priorityGrades.reduce((sum, g) => sum + g.score, 0)
}