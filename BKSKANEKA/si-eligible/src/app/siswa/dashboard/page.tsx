// src/app/siswa/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SiswaDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    nilaiVerified: 0,
    totalNilai: 0,
    peminatanFilled: false,
    kelulusanReported: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      // Fetch nilai stats
      const nilaiRes = await fetch('/api/siswa/nilai');
      if (nilaiRes.ok) {
        const nilaiData: Array<{ isVerified: boolean }> = await nilaiRes.json();
        const totalNilai = nilaiData.length;
        const verifiedNilai = nilaiData.filter(n => n.isVerified).length;
        setStats(prev => ({ ...prev, totalNilai, nilaiVerified: verifiedNilai }));
      }

      // Fetch peminatan stats
      const peminatanRes = await fetch('/api/siswa/peminatan');
      if (peminatanRes.ok) {
        const peminatanData = await peminatanRes.json();
        const peminatanFilled = peminatanData.length > 0;
        setStats(prev => ({ ...prev, peminatanFilled }));
      }

      // Fetch kelulusan stats
      const kelulusanRes = await fetch('/api/siswa/kelulusan');
      if (kelulusanRes.ok) {
        const kelulusanData = await kelulusanRes.json();
        const kelulusanReported = kelulusanData !== null;
        setStats(prev => ({ ...prev, kelulusanReported }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Selamat Datang, {session?.user?.name}! 👋
        </h1>
        <p className="text-gray-600">Kelola data verifikasi dan peminatan kampus Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📝
            </div>
            <span className="text-sm text-gray-500">Nilai</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {stats.nilaiVerified}/{stats.totalNilai}
          </div>
          <div className="text-sm text-gray-600">Terverifikasi</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              🎯
            </div>
            <span className="text-sm text-gray-500">Peminatan</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {stats.peminatanFilled ? '✓' : '✗'}
          </div>
          <div className="text-sm text-gray-600">
            {stats.peminatanFilled ? 'Sudah Diisi' : 'Belum Diisi'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              🎓
            </div>
            <span className="text-sm text-gray-500">Kelulusan</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {stats.kelulusanReported ? '✓' : '✗'}
          </div>
          <div className="text-sm text-gray-600">
            {stats.kelulusanReported ? 'Sudah Dilaporkan' : 'Belum Dilaporkan'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <span className="text-sm text-gray-500">Sanggahan</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">0</div>
          <div className="text-sm text-gray-600">Aktif</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Aksi Cepat</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/siswa/verifikasi-nilai"
            className="p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition group"
          >
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold text-gray-800 mb-1">Verifikasi Nilai</h3>
            <p className="text-sm text-gray-600">Cek dan verifikasi nilai rapor Anda</p>
          </a>

          <a
            href="/siswa/peminatan"
            className="p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition group"
          >
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-800 mb-1">Input Peminatan</h3>
            <p className="text-sm text-gray-600">Pilih kampus dan jurusan tujuan</p>
          </a>

          <a
            href="/siswa/kelulusan"
            className="p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition group"
          >
            <div className="text-3xl mb-2">🎓</div>
            <h3 className="font-semibold text-gray-800 mb-1">Lapor Kelulusan</h3>
            <p className="text-sm text-gray-600">Upload bukti penerimaan kampus</p>
          </a>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Timeline Jalur Seleksi</h2>
        <div className="space-y-4">
          {[
            { jalur: 'SNBP', buka: '10 Jan 2025', tutup: '20 Feb 2025', status: 'open' },
            { jalur: 'SPAN-PTKIN', buka: '1 Feb 2025', tutup: '10 Mar 2025', status: 'soon' },
            { jalur: 'SNBT', buka: '15 Mar 2025', tutup: '5 Apr 2025', status: 'soon' }
          ].map((item) => (
            <div key={item.jalur} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-semibold text-gray-800">{item.jalur}</h3>
                <p className="text-sm text-gray-600">
                  {item.buka} - {item.tutup}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.status === 'open' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {item.status === 'open' ? 'Dibuka' : 'Segera'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}