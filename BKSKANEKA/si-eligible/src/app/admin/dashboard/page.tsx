// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalNilaiVerified: 0,
    totalSanggahanPending: 0,
    totalKelulusan: 0
  });

  useEffect(() => {
    // TODO: Fetch dari API
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to dummy data
        setStats({
          totalSiswa: 156,
          totalNilaiVerified: 89,
          totalSanggahanPending: 5,
          totalKelulusan: 120
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Ringkasan data dan statistik sistem</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              👨‍🎓
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{stats.totalSiswa}</div>
          <div className="text-sm text-gray-600">Total Siswa</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{stats.totalNilaiVerified}</div>
          <div className="text-sm text-gray-600">Nilai Terverifikasi</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
              ⚠️
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{stats.totalSanggahanPending}</div>
          <div className="text-sm text-gray-600">Sanggahan Pending</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              🎓
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{stats.totalKelulusan}</div>
          <div className="text-sm text-gray-600">Siswa Diterima</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Aksi Cepat</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Link
            href="/admin/siswa/tambah"
            className="p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-center"
          >
            <div className="text-3xl mb-2">➕</div>
            <h3 className="font-semibold text-gray-800 text-sm">Tambah Siswa</h3>
          </Link>

          <Link
            href="/admin/siswa/import"
            className="p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition text-center"
          >
            <div className="text-3xl mb-2">📥</div>
            <h3 className="font-semibold text-gray-800 text-sm">Import Excel</h3>
          </Link>

          <Link
            href="/admin/kampus/tambah"
            className="p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition text-center"
          >
            <div className="text-3xl mb-2">🏫</div>
            <h3 className="font-semibold text-gray-800 text-sm">Tambah Kampus</h3>
          </Link>

          <Link
            href="/admin/export"
            className="p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition text-center"
          >
            <div className="text-3xl mb-2">📤</div>
            <h3 className="font-semibold text-gray-800 text-sm">Export Data</h3>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Aktivitas Terbaru</h2>
          <div className="space-y-3">
            {[
              { user: 'Budi Santoso', action: 'Verifikasi nilai semester 5', time: '5 menit lalu' },
              { user: 'Admin', action: 'Import 50 data siswa baru', time: '1 jam lalu' },
              { user: 'Siti Nurhaliza', action: 'Ajukan sanggahan nilai Matematika', time: '2 jam lalu' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm shrink-0">
                  {activity.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{activity.user}</p>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sanggahan Terbaru</h2>
          <div className="space-y-3">
            {[
              { siswa: 'Ahmad Fauzi', mapel: 'Fisika', semester: 4, status: 'pending' },
              { siswa: 'Dewi Lestari', mapel: 'Kimia', semester: 5, status: 'pending' }
            ].map((sanggah, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <div>
                  <p className="text-sm font-medium text-gray-800">{sanggah.siswa}</p>
                  <p className="text-xs text-gray-600">
                    {sanggah.mapel} - Semester {sanggah.semester}
                  </p>
                </div>
                <Link
                  href="/admin/sanggahan"
                  className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-lg text-xs font-medium hover:bg-yellow-300 transition"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}