// src/app/admin/kampus/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Kampus {
  id: string;
  kodeKampus: string;
  namaKampus: string;
  jenisKampus: string;
  kategoriJalur: string;
  akreditasi: string | null;
  provinsi: string;
  kota: string;
  jurusanCount: number;
}

export default function DataKampusPage() {
  const [kampus, setKampus] = useState<Kampus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');

  useEffect(() => {
    fetchKampus();
  }, []);

  const fetchKampus = async () => {
    try {
      const res = await fetch('/api/admin/kampus');
      if (res.ok) {
        const data = await res.json();
        setKampus(data);
      }
    } catch (error) {
      console.error('Error fetching kampus:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredKampus = kampus.filter(k => {
    const matchSearch = k.namaKampus.toLowerCase().includes(search.toLowerCase()) ||
                       k.kodeKampus.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filterJenis || k.jenisKampus === filterJenis;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Master Data Kampus</h1>
          <p className="text-gray-600">Kelola data kampus dan jurusan</p>
        </div>
        <Link
          href="/admin/kampus/tambah"
          className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium flex items-center gap-2"
        >
          <span>➕</span>
          Tambah Kampus
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Cari nama atau kode kampus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Semua Jenis</option>
            <option value="PTN">PTN</option>
            <option value="PTKIN">PTKIN</option>
            <option value="PTS">PTS</option>
            <option value="Kedinasan">Kedinasan</option>
          </select>
        </div>
      </div>

      {/* Kampus Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat data...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKampus.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Tidak ada data kampus
            </div>
          ) : (
            filteredKampus.map((k) => (
              <div
                key={k.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                    🏫
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      {k.jenisKampus}
                    </span>
                    {k.akreditasi && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        {k.akreditasi}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{k.namaKampus}</h3>
                <p className="text-sm text-gray-600 mb-1">Kode: {k.kodeKampus}</p>
                <p className="text-sm text-gray-600 mb-3">
                  📍 {k.kota}, {k.provinsi}
                </p>
                <p className="text-sm text-purple-600 font-medium mb-4">
                  {k.jurusanCount} Program Studi
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/kampus/${k.id}`}
                    className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition text-sm font-medium text-center"
                  >
                    Detail
                  </Link>
                  <Link
                    href={`/admin/kampus/${k.id}/jurusan/tambah`}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition text-sm font-medium"
                  >
                    + Prodi
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}