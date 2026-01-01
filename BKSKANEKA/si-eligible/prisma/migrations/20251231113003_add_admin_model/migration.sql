-- CreateTable
CREATE TABLE `Siswa` (
    `id` VARCHAR(191) NOT NULL,
    `nisn` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tanggalLahir` DATETIME(3) NOT NULL,
    `kelas` VARCHAR(191) NOT NULL,
    `jurusan` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `noTelepon` VARCHAR(191) NULL,
    `statusKIPK` BOOLEAN NOT NULL DEFAULT false,
    `isDataLocked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Siswa_nisn_key`(`nisn`),
    INDEX `Siswa_nisn_idx`(`nisn`),
    INDEX `Siswa_kelas_jurusan_idx`(`kelas`, `jurusan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Peminatan` (
    `id` VARCHAR(191) NOT NULL,
    `siswaId` VARCHAR(191) NOT NULL,
    `pilihan` INTEGER NOT NULL,
    `kampusId` VARCHAR(191) NOT NULL,
    `jurusanId` VARCHAR(191) NOT NULL,
    `jalur` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Peminatan_siswaId_idx`(`siswaId`),
    INDEX `Peminatan_jurusanId_fkey`(`jurusanId`),
    INDEX `Peminatan_kampusId_fkey`(`kampusId`),
    UNIQUE INDEX `Peminatan_siswaId_pilihan_key`(`siswaId`, `pilihan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sanggahan` (
    `id` VARCHAR(191) NOT NULL,
    `siswaId` VARCHAR(191) NOT NULL,
    `semester` INTEGER NOT NULL,
    `mataPelajaran` VARCHAR(191) NOT NULL,
    `nilaiLama` DOUBLE NOT NULL,
    `nilaiBaru` DOUBLE NOT NULL,
    `buktiRapor` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `keterangan` TEXT NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Sanggahan_siswaId_idx`(`siswaId`),
    INDEX `Sanggahan_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kelulusan` (
    `id` VARCHAR(191) NOT NULL,
    `siswaId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `kampusId` VARCHAR(191) NOT NULL,
    `jurusanId` VARCHAR(191) NOT NULL,
    `jalur` VARCHAR(191) NOT NULL,
    `buktiPenerimaan` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Kelulusan_siswaId_key`(`siswaId`),
    INDEX `Kelulusan_jurusanId_fkey`(`jurusanId`),
    INDEX `Kelulusan_kampusId_fkey`(`kampusId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NilaiRapor` (
    `id` VARCHAR(191) NOT NULL,
    `siswaId` VARCHAR(191) NOT NULL,
    `semester` INTEGER NOT NULL,
    `mataPelajaran` VARCHAR(191) NOT NULL,
    `nilai` DOUBLE NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NilaiRapor_siswaId_idx`(`siswaId`),
    INDEX `NilaiRapor_semester_idx`(`semester`),
    UNIQUE INDEX `NilaiRapor_siswaId_semester_mataPelajaran_key`(`siswaId`, `semester`, `mataPelajaran`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TahunAkademik` (
    `id` VARCHAR(191) NOT NULL,
    `tahun` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `tanggalMulai` DATETIME(3) NOT NULL,
    `tanggalSelesai` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TahunAkademik_tahun_key`(`tahun`),
    INDEX `TahunAkademik_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PeriodeJalur` (
    `id` VARCHAR(191) NOT NULL,
    `tahunAkademikId` VARCHAR(191) NOT NULL,
    `jalur` VARCHAR(191) NOT NULL,
    `namaJalur` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `tanggalBukaPendaftaran` DATETIME(3) NOT NULL,
    `tanggalTutupPendaftaran` DATETIME(3) NOT NULL,
    `tanggalPengumuman` DATETIME(3) NOT NULL,
    `kuotaNasional` INTEGER NULL,
    `minimalRataRata` DOUBLE NULL,
    `deskripsi` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PeriodeJalur_tahunAkademikId_idx`(`tahunAkademikId`),
    INDEX `PeriodeJalur_jalur_isActive_idx`(`jalur`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KonfigurasiNilai` (
    `id` VARCHAR(191) NOT NULL,
    `tahunAkademikId` VARCHAR(191) NOT NULL,
    `kurikulum` VARCHAR(191) NOT NULL,
    `jalur` VARCHAR(191) NOT NULL,
    `bobotSemester1` DOUBLE NOT NULL DEFAULT 0,
    `bobotSemester2` DOUBLE NOT NULL DEFAULT 0,
    `bobotSemester3` DOUBLE NOT NULL DEFAULT 0,
    `bobotSemester4` DOUBLE NOT NULL DEFAULT 0,
    `bobotSemester5` DOUBLE NOT NULL DEFAULT 0,
    `mataPelajaranWajib` JSON NOT NULL,
    `mataPelajaranPeminatan` JSON NOT NULL,
    `formulaPerhitungan` VARCHAR(191) NOT NULL,
    `customFormula` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `KonfigurasiNilai_tahunAkademikId_idx`(`tahunAkademikId`),
    UNIQUE INDEX `KonfigurasiNilai_tahunAkademikId_kurikulum_jalur_key`(`tahunAkademikId`, `kurikulum`, `jalur`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KonfigurasiKuota` (
    `id` VARCHAR(191) NOT NULL,
    `tahunAkademikId` VARCHAR(191) NOT NULL,
    `jalur` VARCHAR(191) NOT NULL,
    `jurusan` VARCHAR(191) NOT NULL,
    `persenKuotaSekolah` DOUBLE NOT NULL,
    `jumlahKuotaSekolah` INTEGER NULL,
    `minimalRataRata` DOUBLE NULL,
    `maksimalSanggahan` INTEGER NULL,
    `wajibKIPK` BOOLEAN NOT NULL DEFAULT false,
    `metodePeRankingan` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `KonfigurasiKuota_tahunAkademikId_idx`(`tahunAkademikId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterKampus` (
    `id` VARCHAR(191) NOT NULL,
    `kodeKampus` VARCHAR(191) NOT NULL,
    `namaKampus` VARCHAR(191) NOT NULL,
    `jenisKampus` VARCHAR(191) NOT NULL,
    `kategoriJalur` VARCHAR(191) NOT NULL,
    `akreditasi` VARCHAR(191) NULL,
    `provinsi` VARCHAR(191) NOT NULL,
    `kota` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `tahunUpdate` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MasterKampus_kodeKampus_key`(`kodeKampus`),
    INDEX `MasterKampus_jenisKampus_idx`(`jenisKampus`),
    INDEX `MasterKampus_kategoriJalur_idx`(`kategoriJalur`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterJurusan` (
    `id` VARCHAR(191) NOT NULL,
    `kampusId` VARCHAR(191) NOT NULL,
    `kodeJurusan` VARCHAR(191) NOT NULL,
    `namaJurusan` VARCHAR(191) NOT NULL,
    `jenjang` VARCHAR(191) NOT NULL,
    `fakultas` VARCHAR(191) NOT NULL,
    `akreditasi` VARCHAR(191) NULL,
    `deskripsi` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `tahunUpdate` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MasterJurusan_kampusId_idx`(`kampusId`),
    UNIQUE INDEX `MasterJurusan_kampusId_kodeJurusan_key`(`kampusId`, `kodeJurusan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'admin',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `userType` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TemplateExport` (
    `id` VARCHAR(191) NOT NULL,
    `tahunAkademikId` VARCHAR(191) NULL,
    `namaTemplate` VARCHAR(191) NOT NULL,
    `jalur` VARCHAR(191) NOT NULL,
    `jenisExport` VARCHAR(191) NOT NULL,
    `mappingKolom` JSON NOT NULL,
    `formatKolom` JSON NOT NULL,
    `headerTemplate` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TemplateExport_jalur_idx`(`jalur`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Peminatan` ADD CONSTRAINT `Peminatan_jurusanId_fkey` FOREIGN KEY (`jurusanId`) REFERENCES `MasterJurusan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Peminatan` ADD CONSTRAINT `Peminatan_kampusId_fkey` FOREIGN KEY (`kampusId`) REFERENCES `MasterKampus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Peminatan` ADD CONSTRAINT `Peminatan_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `Siswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sanggahan` ADD CONSTRAINT `Sanggahan_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `Siswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kelulusan` ADD CONSTRAINT `Kelulusan_jurusanId_fkey` FOREIGN KEY (`jurusanId`) REFERENCES `MasterJurusan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kelulusan` ADD CONSTRAINT `Kelulusan_kampusId_fkey` FOREIGN KEY (`kampusId`) REFERENCES `MasterKampus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kelulusan` ADD CONSTRAINT `Kelulusan_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `Siswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NilaiRapor` ADD CONSTRAINT `NilaiRapor_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `Siswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PeriodeJalur` ADD CONSTRAINT `PeriodeJalur_tahunAkademikId_fkey` FOREIGN KEY (`tahunAkademikId`) REFERENCES `TahunAkademik`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KonfigurasiNilai` ADD CONSTRAINT `KonfigurasiNilai_tahunAkademikId_fkey` FOREIGN KEY (`tahunAkademikId`) REFERENCES `TahunAkademik`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KonfigurasiKuota` ADD CONSTRAINT `KonfigurasiKuota_tahunAkademikId_fkey` FOREIGN KEY (`tahunAkademikId`) REFERENCES `TahunAkademik`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MasterJurusan` ADD CONSTRAINT `MasterJurusan_kampusId_fkey` FOREIGN KEY (`kampusId`) REFERENCES `MasterKampus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
