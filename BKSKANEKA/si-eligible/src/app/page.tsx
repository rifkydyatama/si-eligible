// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-indigo-600 to-blue-600">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/10 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                SE
              </div>
              <span className="text-white font-bold text-xl">Si-Eligible</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#fitur" className="text-white hover:text-pink-200 transition">Fitur</a>
              <a href="#tentang" className="text-white hover:text-pink-200 transition">Tentang</a>
              <Link href="/login" className="text-white hover:text-pink-200 transition">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Si-Eligible
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Sistem Perangkingan, Verifikasi Mandiri, Penjaringan Minat, hingga Monitoring Alumni
            <br />
            <span className="font-semibold">SMKN 1 Kademangan</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-pink-100 transition shadow-xl"
            >
              Masuk Sekarang
            </Link>
            <a 
              href="#fitur" 
              className="px-8 py-4 bg-white/20 text-white border-2 border-white rounded-full font-semibold hover:bg-white/30 transition"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="fitur" className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Fitur Unggulan
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "👨‍🎓",
                title: "Portal Siswa",
                desc: "Verifikasi nilai mandiri, input peminatan kampus, dan lapor status kelulusan"
              },
              {
                icon: "👨‍🏫",
                title: "Dashboard Admin",
                desc: "Import data masal, approval sanggahan, dan monitoring sebaran kampus"
              },
              {
                icon: "📊",
                title: "Perangkingan Otomatis",
                desc: "Sistem ranking otomatis per jurusan dengan dukungan Kurikulum Merdeka"
              },
              {
                icon: "🎯",
                title: "Klasterisasi Kampus",
                desc: "Otomatis memisahkan data SNBP, SPAN-PTKIN, dan jalur lainnya"
              },
              {
                icon: "📈",
                title: "Monitoring Alumni",
                desc: "Pantau sebaran alumni di berbagai kampus untuk analisis komprehensif"
              },
              {
                icon: "📥",
                title: "Multi-Export",
                desc: "Export ke format PDSS SNPMB, SPAN-PTKIN, dan rekap internal"
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/80">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { num: "200+", label: "Siswa Terdaftar" },
              { num: "90%", label: "Tingkat Kelulusan PTN" },
              { num: "50+", label: "Kampus Tujuan" },
              { num: "100%", label: "Data Terverifikasi" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">{stat.num}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/80">
          <p>&copy; 2025 SMKN 1 Kademangan. Si-Eligible - All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}