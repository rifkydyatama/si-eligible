// src/app/admin/siswa/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
}

export default function EditSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nisn: '',
    nama: '',
    tanggalLahir: '',
    kelas: '',
    jurusan: '',
    email: '',
    noTelepon: '',
    statusKIPK: false
  });

  useEffect(() => {
    if (params.id) {
      fetchSiswaData();
    }
  }, [params.id]);

  const fetchSiswaData = async () => {
    try {
      const res = await fetch(`/api/admin/siswa/${params.id}`);
      if (res.ok) {
        const siswa: SiswaData = await res.json();
        setFormData({
          nisn: siswa.nisn,
          nama: siswa.nama,
          tanggalLahir: siswa.tanggalLahir.split('T')[0], // Format for date input
          kelas: siswa.kelas,
          jurusan: siswa.jurusan,
          email: siswa.email || '',
          noTelepon: siswa.noTelepon || '',
          statusKIPK: siswa.statusKIPK
        });
      } else {
        setError('Gagal memuat data siswa');
      }
    } catch (err) {
      console.error('Error fetching siswa:', err);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/siswa/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tanggalLahir: new Date(formData.tanggalLahir).toISOString()
        })
      });

      if (res.ok) {
        alert('Siswa berhasil diperbarui!');
        router.push('/admin/siswa');
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal memperbarui siswa');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err) || 'Terjadi kesalahan');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Siswa</h1>
        <p className="text-gray-600">Perbarui informasi siswa</p>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NISN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                NISN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="Masukkan NISN (10 digit)"
                required
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Masukkan nama lengkap"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Kelas & Jurusan */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Pilih Kelas</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jurusan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jurusan}
                  onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Pilih Jurusan</option>
                  <option value="IPA">IPA</option>
                  <option value="IPS">IPS</option>
                  <option value="Bahasa">Bahasa</option>
                </select>
              </div>
            </div>

            {/* Email & No Telepon */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. Telepon
                </label>
                <input
                  type="tel"
                  value={formData.noTelepon}
                  onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Status KIP-K */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="kipk"
                checked={formData.statusKIPK}
                onChange={(e) => setFormData({ ...formData, statusKIPK: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="kipk" className="text-sm font-medium text-gray-700">
                Penerima KIP-Kuliah
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Perbarui Siswa'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}