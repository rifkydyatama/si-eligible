"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ShieldCheck, GraduationCap, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
      <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">

        {/* 1. BACKGROUND BERGERAK (Aurora Effect) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        {/* Grid Pattern halus */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

        {/* 2. KONTEN UTAMA */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">

          {/* Badge "New System" */}
          <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium"
          >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
            Sistem SNBP 2025 Ready
          </motion.div>

          {/* Headline Besar */}
          <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Pantau Peluangmu, <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-400 to-emerald-400">
            Raih Kampus Impian.
          </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl text-slate-400 text-lg md:text-xl mb-10"
          >
            Sistem cerdas untuk analisis nilai rapor, pemeringkatan otomatis,
            dan prediksi kelayakan SNBP secara transparan & real-time.
          </motion.p>

          {/* Tombol CTA */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 items-center"
          >
            {/* Tombol Login Siswa (Nanti kita buat halamannya) */}
            <Link href="/student/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_20px_rgba(37,99,235,0.5)] h-12 px-8 text-lg">
                  Cek Data Saya
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>

            {/* Tombol Login Admin (Yang barusan kita buat) */}
            <Link href="/admin/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="border-slate-700 text-slate-300 hover:bg-slate-800 h-12 px-8 text-lg bg-transparent">
                  <LockKeyhole className="mr-2 w-4 h-4"/>
                  Login Admin / Guru
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* 3. FITUR HIGHLIGHT */}
          <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full max-w-5xl"
          >
            <FeatureCard
                icon={<BarChart3 className="w-8 h-8 text-blue-400" />}
                title="Real-Time Ranking"
                desc="Posisi ranking diperbarui otomatis setiap ada perubahan data nilai."
            />
            <FeatureCard
                icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
                title="Data Terverifikasi"
                desc="Sistem validasi berlapis menjamin keakuratan nilai rapor siswa."
            />
            <FeatureCard
                icon={<GraduationCap className="w-8 h-8 text-purple-400" />}
                title="Klasterisasi Kampus"
                desc="Pemisahan otomatis antara kuota PTN, PTKIN, dan Politeknik."
            />
          </motion.div>

        </main>
      </div>
  );
}

// Komponen Kartu Kecil
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
      <motion.div
          whileHover={{ y: -5 }}
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-blue-500/50 transition-colors"
      >
        <div className="mb-4 bg-slate-800/50 w-fit p-3 rounded-lg">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed">
          {desc}
        </p>
      </motion.div>
  )
}