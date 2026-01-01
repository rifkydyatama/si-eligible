'use client';

import { useEffect, useState } from 'react';

interface MonitoringStats {
  totalSiswa: number;
  totalKelulusan: number;
  totalPeminatan: number;
  kelulusanByMonth: Array<{
    month: string;
    count: number;
  }>;
  kelulusanByKampusType: Array<{
    jenisKampus: string;
    count: number;
  }>;
  kelulusanByJurusan: Array<{
    namaJurusan: string;
    count: number;
  }>;
  topKampus: Array<{
    namaKampus: string;
    count: number;
  }>;
}

export default function MonitoringPage() {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const res = await fetch('/api/admin/monitoring');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
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

  if (!stats) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Gagal memuat data monitoring</p>
        </div>
      </div>
    );
  }

  const graduationRate = stats.totalSiswa > 0 ? ((stats.totalKelulusan / stats.totalSiswa) * 100).toFixed(1) : '0';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Monitoring Alumni</h1>
        <p className="text-gray-600">Pantau data kelulusan dan distribusi alumni</p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              👨‍🎓
            </div>
            <span className="text-sm text-gray-500">Total Siswa</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {stats.totalSiswa.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Siswa terdaftar</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              🎓
            </div>
            <span className="text-sm text-gray-500">Lulus</span>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {stats.totalKelulusan.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Alumni berhasil</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              🎯
            </div>
            <span className="text-sm text-gray-500">Peminatan</span>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {stats.totalPeminatan.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Pilihan kampus</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
              📊
            </div>
            <span className="text-sm text-gray-500">Tingkat Kelulusan</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {graduationRate}%
          </div>
          <p className="text-sm text-gray-600">Rasio kelulusan</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Graduation Trend */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Trend Kelulusan Bulanan</h3>
          <div className="space-y-3">
            {stats.kelulusanByMonth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((item.count / Math.max(...stats.kelulusanByMonth.map(m => m.count))) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Campuses */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Kampus Tujuan Terpopuler</h3>
          <div className="space-y-3">
            {stats.topKampus.slice(0, 10).map((kampus, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-700">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-800">{kampus.namaKampus}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">{kampus.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution by Campus Type */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribusi berdasarkan Jenis Kampus</h3>
          <div className="space-y-3">
            {stats.kelulusanByKampusType.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.jenisKampus}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((item.count / Math.max(...stats.kelulusanByKampusType.map(k => k.count))) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Majors */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Jurusan Terpopuler</h3>
          <div className="space-y-3">
            {stats.kelulusanByJurusan.slice(0, 10).map((jurusan, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-700">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-800">{jurusan.namaJurusan}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">{jurusan.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}