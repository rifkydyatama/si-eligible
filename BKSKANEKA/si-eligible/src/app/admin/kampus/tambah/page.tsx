// src/app/admin/kampus/tambah/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TambahKampusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    kodeKampus: '',
    namaKampus: '',
    jenisKampus: '',
    kategoriJalur: '',
    akreditasi: '',
    provinsi: '',
    kota: '',
    website: '',
    logoUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/kampus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Kampus berhasil ditambahkan!');
        router.push('/admin/kampus');
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal menambahkan kampus');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tambah Kampus Baru</h1>
        <p className="text-gray-600">Isi form untuk menambahkan kampus secara manual</p>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kode Kampus & Nama Kampus */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kode Kampus <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.kodeKampus}
                  onChange={(e) => setFormData({ ...formData, kodeKampus: e.target.value })}
                  placeholder="Contoh: UB001"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Kampus <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.namaKampus}
                  onChange={(e) => setFormData({ ...formData, namaKampus: e.target.value })}
                  placeholder="Contoh: Universitas Brawijaya"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Jenis Kampus & Kategori Jalur */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Kampus <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jenisKampus}
                  onChange={(e) => setFormData({ ...formData, jenisKampus: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Pilih Jenis</option>
                  <option value="PTN">PTN (Perguruan Tinggi Negeri)</option>
                  <option value="PTKIN">PTKIN (UIN/IAIN/STAIN)</option>
                  <option value="PTS">PTS (Perguruan Tinggi Swasta)</option>
                  <option value="Kedinasan">Kedinasan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori Jalur <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kategoriJalur}
                  onChange={(e) => setFormData({ ...formData, kategoriJalur: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="SNPMB">SNPMB (SNBP/SNBT)</option>
                  <option value="PTKIN">PTKIN (SPAN-PTKIN/UM-PTKIN)</option>
                  <option value="Mandiri">Mandiri</option>
                </select>
              </div>
            </div>

            {/* Akreditasi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
Akreditasi
</label>
<select
value={formData.akreditasi}
onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
>
<option value="">Pilih Akreditasi</option>
<option value="A">A (Unggul)</option>
<option value="B">B (Baik Sekali)</option>
<option value="C">C (Baik)</option>
</select>
</div>
        {/* Provinsi & Kota */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Provinsi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.provinsi}
              onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
              placeholder="Contoh: Jawa Timur"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kota <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.kota}
              onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
              placeholder="Contoh: Malang"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Website & Logo URL */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://kampus.ac.id"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : 'Simpan Kampus'}
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