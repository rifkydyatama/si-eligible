// src/app/admin/siswa/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface SiswaData {
  id: string;
  nisn: string;
  nama: string;
  tanggalLahir: string;
  kelas: string;
  jurusan: string;
  email: string | null;
  noTelepon: string | null;
  statusKIPK: boolean;
  nilaiRapor: Array<{
    id: string;
    semester: number;
    mataPelajaran: string;
    nilai: number;
    isVerified: boolean;
  }>;
  peminatan: Array<{
    id: string;
    kampus: {
      nama: string;
    };
    jurusan: {
      nama: string;
    };
  }>;
}

export default function DetailSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const [siswa, setSiswa] = useState<SiswaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchSiswaData();
    }
  }, [params.id]);

  const fetchSiswaData = async () => {
    try {
      const res = await fetch(`/api/admin/siswa/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setSiswa(data);
      } else {
        setError('Gagal memuat data siswa');
      }
    } catch (err) {
      console.error('Error fetching siswa:', err);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/siswa/${params.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Siswa berhasil dihapus!');
        router.push('/admin/siswa');
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus siswa');
      }
    } catch (err) {
      console.error('Error deleting siswa:', err);
      alert('Terjadi kesalahan saat menghapus siswa');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuat data siswa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !siswa) {
    return (
      <div className="p-8">
        <div className="text-center min-h-[400px] flex items-center justify-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error || 'Siswa tidak ditemukan'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Detail Siswa</h1>
          <p className="text-gray-600">Informasi lengkap siswa</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/siswa/${siswa.id}/edit`}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium flex items-center gap-2"
          >
            <span>✏️</span>
            Edit Siswa
          </Link>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center gap-2"
          >
            <span>🗑️</span>
            Hapus Siswa
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Informasi Dasar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Dasar</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">NISN</label>
                <p className="text-lg font-semibold text-gray-800">{siswa.nisn}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nama Lengkap</label>
                <p className="text-lg font-semibold text-gray-800">{siswa.nama}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Lahir</label>
                <p className="text-lg text-gray-800">
                  {new Date(siswa.tanggalLahir).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Kelas</label>
                <p className="text-lg text-gray-800">{siswa.kelas}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Jurusan</label>
                <p className="text-lg text-gray-800">{siswa.jurusan}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status KIP-K</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  siswa.statusKIPK
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {siswa.statusKIPK ? 'Ya' : 'Tidak'}
                </span>
              </div>
            </div>
          </div>

          {/* Kontak */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Kontak</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-lg text-gray-800">{siswa.email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">No. Telepon</label>
                <p className="text-lg text-gray-800">{siswa.noTelepon || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Peminatan & Nilai */}
        <div className="space-y-6">
          {/* Peminatan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Peminatan</h2>
            {siswa.peminatan.length > 0 ? (
              <div className="space-y-3">
                {siswa.peminatan.map((peminatan) => (
                  <div key={peminatan.id} className="p-3 bg-purple-50 rounded-xl">
                    <p className="font-medium text-purple-800">{peminatan.kampus.nama}</p>
                    <p className="text-sm text-purple-600">{peminatan.jurusan.nama}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Belum ada peminatan</p>
            )}
          </div>

          {/* Statistik Nilai */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Statistik Nilai</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Nilai</span>
                <span className="font-semibold">{siswa.nilaiRapor.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nilai Terverifikasi</span>
                <span className="font-semibold text-green-600">
                  {siswa.nilaiRapor.filter(n => n.isVerified).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rata-rata</span>
                <span className="font-semibold">
                  {siswa.nilaiRapor.length > 0
                    ? (siswa.nilaiRapor.reduce((sum, n) => sum + n.nilai, 0) / siswa.nilaiRapor.length).toFixed(2)
                    : '0.00'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nilai Rapor */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Nilai Rapor</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Semester</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Mata Pelajaran</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nilai</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {siswa.nilaiRapor.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data nilai rapor
                  </td>
                </tr>
              ) : (
                siswa.nilaiRapor.map((nilai) => (
                  <tr key={nilai.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-800">{nilai.semester}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{nilai.mataPelajaran}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{nilai.nilai}</td>
                    <td className="px-6 py-4">
                      {nilai.isVerified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                          ✓ Terverifikasi
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
                          ⏳ Menunggu
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}