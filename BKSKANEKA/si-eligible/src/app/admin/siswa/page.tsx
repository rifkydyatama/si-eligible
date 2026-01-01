// src/app/admin/siswa/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  jurusan: string;
  statusKIPK: boolean;
}

export default function DataSiswaPage() {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSiswa();
  }, []);

  const fetchSiswa = async () => {
    try {
      const res = await fetch('/api/admin/siswa');
      if (res.ok) {
        const data = await res.json();
        setSiswa(data);
      }
    } catch (error) {
      console.error('Error fetching siswa:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSiswa = siswa.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.nisn.includes(search)
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Siswa</h1>
          <p className="text-gray-600">Kelola data siswa dan nilai rapor</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/siswa/import"
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium flex items-center gap-2"
          >
            <span>📥</span>
            Import Excel
          </Link>
          <Link
            href="/admin/siswa/tambah"
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium flex items-center gap-2"
          >
            <span>➕</span>
            Tambah Manual
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Cari nama atau NISN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Semua Kelas</option>
            <option value="12">Kelas 12</option>
            <option value="11">Kelas 11</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Semua Jurusan</option>
            <option value="IPA">IPA</option>
            <option value="IPS">IPS</option>
            <option value="Bahasa">Bahasa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">NISN</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Kelas</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Jurusan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">KIP-K</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada data siswa
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-800">{s.nisn}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{s.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.kelas}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.jurusan}</td>
                      <td className="px-6 py-4">
                        {s.statusKIPK ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                            Ya
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            Tidak
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/siswa/${s.id}`}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition"
                          >
                            Detail
                          </Link>
                          <Link
                            href={`/admin/siswa/${s.id}/edit`}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}