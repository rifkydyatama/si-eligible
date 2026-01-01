// src/app/admin/kampus/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  website: string | null;
  logoUrl: string | null;
  isActive: boolean;
  tahunUpdate: string;
  jurusan: Jurusan[];
}

interface Jurusan {
  id: string;
  kodeJurusan: string;
  namaJurusan: string;
  jenjang: string;
  fakultas: string;
  akreditasi: string | null;
  isActive: boolean;
}

export default function DetailKampusPage() {
  const params = useParams();
  const [kampus, setKampus] = useState<Kampus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchKampusDetail = async () => {
    try {
      const res = await fetch(`/api/admin/kampus/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setKampus(data);
      } else if (res.status === 404) {
        setError('Kampus tidak ditemukan');
      } else {
        setError('Gagal memuat data kampus');
      }
    } catch (error) {
      console.error('Error fetching kampus detail:', error);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchKampusDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleDeleteJurusan = async (jurusanId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus program studi ini?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/kampus/${params.id}/jurusan/${jurusanId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Refresh data
        fetchKampusDetail();
      } else {
        alert('Gagal menghapus program studi');
      }
    } catch (error) {
      console.error('Error deleting jurusan:', error);
      alert('Terjadi kesalahan saat menghapus program studi');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat data kampus...</p>
        </div>
      </div>
    );
  }

  if (error || !kampus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-4">{error || 'Kampus tidak ditemukan'}</div>
          <Link
            href="/admin/kampus"
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
          >
            Kembali ke Daftar Kampus
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/kampus"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
            >
              ← Kembali
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{kampus.namaKampus}</h1>
              <p className="text-gray-600">Kode: {kampus.kodeKampus}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/kampus/${kampus.id}/jurusan/tambah`}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium flex items-center gap-2"
            >
              <span>➕</span>
              Tambah Program Studi
            </Link>
          </div>
        </div>

        {/* Kampus Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Kampus</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Jenis Kampus</label>
              <p className="text-lg font-semibold text-gray-800">{kampus.jenisKampus}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Kategori Jalur</label>
              <p className="text-lg font-semibold text-gray-800">{kampus.kategoriJalur}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Akreditasi</label>
              <p className="text-lg font-semibold text-gray-800">{kampus.akreditasi || 'Tidak ada'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Lokasi</label>
              <p className="text-lg font-semibold text-gray-800">{kampus.kota}, {kampus.provinsi}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Website</label>
              <p className="text-lg font-semibold text-gray-800">
                {kampus.website ? (
                  <a href={kampus.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                    {kampus.website}
                  </a>
                ) : 'Tidak ada'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <p className={`text-lg font-semibold ${kampus.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {kampus.isActive ? 'Aktif' : 'Tidak Aktif'}
              </p>
            </div>
          </div>
        </div>

        {/* Program Studi */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Program Studi ({kampus.jurusan.length})</h2>
          </div>

          {kampus.jurusan.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg">Belum ada program studi</p>
              <p className="text-sm">Tambahkan program studi pertama untuk kampus ini</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kampus.jurusan.map((jurusan) => (
                <div
                  key={jurusan.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">{jurusan.namaJurusan}</h3>
                      <p className="text-sm text-gray-600">Kode: {jurusan.kodeJurusan}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        jurusan.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {jurusan.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                      {jurusan.akreditasi && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                          {jurusan.akreditasi}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-600">Jenjang: {jurusan.jenjang}</p>
                    <p className="text-sm text-gray-600">Fakultas: {jurusan.fakultas}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteJurusan(jurusan.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}