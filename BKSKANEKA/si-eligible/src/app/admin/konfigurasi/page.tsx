// src/app/admin/konfigurasi/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface TahunAkademik {
  id: string;
  tahun: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    periodeJalur: number;
    konfigurasiNilai: number;
    konfigurasiKuota: number;
  };
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default function KonfigurasiPage() {
  const [activeTab, setActiveTab] = useState('tahun-akademik');

  const tabs = [
    { id: 'tahun-akademik', label: '📅 Tahun Akademik', icon: '📅' },
    { id: 'periode-jalur', label: '⏰ Periode Jalur', icon: '⏰' },
    { id: 'nilai', label: '📊 Konfigurasi Nilai', icon: '📊' },
    { id: 'kuota', label: '🎯 Kuota & Ranking', icon: '🎯' },
    { id: 'export', label: '📤 Template Export', icon: '📤' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Konfigurasi Sistem</h1>
        <p className="text-gray-600">Kelola konfigurasi sistem yang dapat diupdate setiap tahun</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 mb-6 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-medium text-sm transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        {activeTab === 'tahun-akademik' && <TahunAkademikForm />}
        {activeTab === 'periode-jalur' && <PeriodeJalurForm />}
        {activeTab === 'nilai' && <KonfigurasiNilaiForm />}
        {activeTab === 'kuota' && <KonfigurasiKuotaForm />}
        {activeTab === 'export' && <TemplateExportForm />}
      </div>
    </div>
  );
}

function TahunAkademikForm() {
  const [formData, setFormData] = useState({
    tahun: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    isActive: false
  });
  const [existingTahunAkademik, setExistingTahunAkademik] = useState<TahunAkademik[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch existing tahun akademik on component mount
  useEffect(() => {
    fetchExistingTahunAkademik();
  }, []);

  const fetchExistingTahunAkademik = async () => {
    try {
      const res = await fetch('/api/admin/konfigurasi/tahun-akademik');
      if (res.ok) {
        const data = await res.json();
        setExistingTahunAkademik(data);
      }
    } catch (error) {
      console.error('Error fetching existing tahun akademik:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.tahun.trim()) {
      alert('Tahun akademik harus diisi');
      return;
    }
    if (!formData.tanggalMulai) {
      alert('Tanggal mulai harus diisi');
      return;
    }
    if (!formData.tanggalSelesai) {
      alert('Tanggal selesai harus diisi');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/konfigurasi/tahun-akademik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const responseData = await res.json();
      console.log('Response:', res.status, responseData);

      if (res.ok) {
        alert('Tahun akademik berhasil ditambahkan!');
        // Reset form
        setFormData({
          tahun: '',
          tanggalMulai: '',
          tanggalSelesai: '',
          isActive: false
        });
        // Refresh the list
        fetchExistingTahunAkademik();
      } else {
        // Handle duplicate error specially
        if (responseData.existing) {
          const existing = responseData.existing;
          const confirmUpdate = confirm(
            `Tahun akademik "${existing.tahun}" sudah ada dengan tanggal ${formatDate(existing.tanggalMulai)} - ${formatDate(existing.tanggalSelesai)}.\n\n` +
            `Apakah Anda ingin mengupdate data yang sudah ada dengan nilai baru?`
          );

          if (confirmUpdate) {
            // Update the existing record using PUT method
            const updateRes = await fetch('/api/admin/konfigurasi/tahun-akademik', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                id: existing.id,
                ...formData
              })
            });

            if (updateRes.ok) {
              alert('Tahun akademik berhasil diupdate!');
              // Reset form
              setFormData({
                tahun: '',
                tanggalMulai: '',
                tanggalSelesai: '',
                isActive: false
              });
              // Refresh the list
              fetchExistingTahunAkademik();
            } else {
              const updateError = await updateRes.json();
              alert(`Gagal mengupdate: ${updateError.error}`);
            }
          }
        } else {
          alert(`Error: ${responseData.error}`);
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ta: TahunAkademik) => {
    setFormData({
      tahun: ta.tahun,
      tanggalMulai: ta.tanggalMulai.split('T')[0], // Convert to YYYY-MM-DD format
      tanggalSelesai: ta.tanggalSelesai.split('T')[0],
      isActive: ta.isActive
    });
    // Scroll to form
    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string, tahun: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus tahun akademik "${tahun}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/konfigurasi/tahun-akademik?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Tahun akademik berhasil dihapus!');
        fetchExistingTahunAkademik();
      } else {
        const error = await res.json();
        alert(`Gagal menghapus: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting tahun akademik:', error);
      alert('Terjadi kesalahan saat menghapus tahun akademik');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tahun Akademik</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tahun Akademik <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.tahun}
            onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
            placeholder="2025/2026"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">Format: YYYY/YYYY (contoh: 2025/2026)</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.tanggalMulai}
              onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Selesai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.tanggalSelesai}
              onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="aktif"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="aktif" className="text-sm font-medium text-gray-700">
            Aktifkan tahun akademik ini (akan menonaktifkan tahun akademik lain)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Menyimpan...' : 'Simpan Tahun Akademik'}
        </button>
      </form>

      {/* List Tahun Akademik */}
      <div className="pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tahun Akademik Terdaftar</h3>

        {existingTahunAkademik.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada tahun akademik terdaftar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {existingTahunAkademik.map((ta: TahunAkademik) => (
              <div
                key={ta.id}
                className={`flex items-center justify-between p-4 border rounded-xl ${
                  ta.isActive
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div>
                  <p className="font-semibold text-gray-800">{ta.tahun}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(ta.tanggalMulai)} - {formatDate(ta.tanggalSelesai)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dibuat: {formatDate(ta.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    ta.isActive
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {ta.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                  <div className="text-xs text-gray-500">
                    {ta._count?.periodeJalur || 0} periode jalur
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(ta)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ta.id, ta.tahun)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PeriodeJalurForm() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Periode & Timeline Jalur</h2>
      <p className="text-gray-600 mb-6">Atur timeline pendaftaran untuk setiap jalur seleksi</p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-700">
          💡 <strong>Tips:</strong> Update timeline ini setiap tahun sesuai pengumuman resmi dari SNPMB dan PTKIN
        </p>
      </div>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Jalur Seleksi <span className="text-red-500">*</span>
          </label>
          <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Pilih Jalur</option>
            <option value="SNBP">SNBP (Seleksi Nasional Berdasarkan Prestasi)</option>
            <option value="SNBT">SNBT (Seleksi Nasional Berdasarkan Tes)</option>
            <option value="SPAN-PTKIN">SPAN-PTKIN</option>
            <option value="UM-PTKIN">UM-PTKIN</option>
          </select>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Buka Pendaftaran
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Tutup Pendaftaran
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Pengumuman
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium"
        >
          Simpan Periode Jalur
        </button>
      </form>
    </div>
  );
}

function KonfigurasiNilaiForm() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Konfigurasi Perhitungan Nilai</h2>
      <p className="text-gray-600 mb-6">Atur bobot semester dan mata pelajaran untuk perhitungan ranking</p>

      <form className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kurikulum
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>Kurikulum Merdeka</option>
              <option>Kurikulum 2013</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jalur Seleksi
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>SNBP</option>
              <option>SNBT</option>
              <option>SPAN-PTKIN</option>
              <option>UM-PTKIN</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-800 mb-4">Bobot Semester</h3>
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((sem) => (
              <div key={sem}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester {sem}
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.2"
                  defaultValue={sem === 5 ? "0.4" : "0.15"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Total bobot harus = 1.0 (contoh: 0.1 + 0.1 + 0.2 + 0.2 + 0.4 = 1.0)
          </p>
        </div>

        <button
          type="submit"
          className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium"
        >
          Simpan Konfigurasi Nilai
        </button>
      </form>
    </div>
  );
}

function KonfigurasiKuotaForm() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Konfigurasi Kuota & Ranking</h2>
      <p className="text-gray-600 mb-6">Atur persentase kuota sekolah dan aturan ranking</p>

      <form className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jalur Seleksi
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>SNBP</option>
              <option>SPAN-PTKIN</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jurusan
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>Semua</option>
              <option>IPA</option>
              <option>IPS</option>
              <option>Bahasa</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Persentase Kuota Sekolah (%)
            </label>
            <input
              type="number"
              placeholder="40"
              defaultValue="40"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Contoh: 40% = Top 40% siswa bisa eligible
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimal Rata-rata Nilai
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="80.0"
              defaultValue="80.0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Metode Perangkingan
          </label>
          <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="per_jurusan">Per Jurusan (IPA vs IPA, IPS vs IPS)</option>
            <option value="per_kelas">Per Kelas</option>
            <option value="all">Semua Siswa</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium"
        >
          Simpan Konfigurasi Kuota
        </button>
      </form>
    </div>
  );
}

function TemplateExportForm() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Template Export</h2>
      <p className="text-gray-600 mb-6">Kelola template export untuk format PDSS SNPMB dan SPAN-PTKIN</p>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-700">
          ⚠️ <strong>Penting:</strong> Template ini akan digunakan untuk export data ke format resmi SNPMB/PTKIN.
          Pastikan mapping kolom sesuai dengan format terbaru.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 border border-gray-200 rounded-xl hover:border-purple-400 transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Template PDSS SNPMB 2025</h3>
              <p className="text-sm text-gray-600">Format export untuk SNBP/SNBT</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              Aktif
            </span>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition text-sm font-medium">
              Edit Template
            </button>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition text-sm font-medium">
              Download Sample
            </button>
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-xl hover:border-purple-400 transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Template SPAN-PTKIN 2025</h3>
              <p className="text-sm text-gray-600">Format export untuk SPAN-PTKIN</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              Aktif
            </span>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition text-sm font-medium">
              Edit Template
            </button>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition text-sm font-medium">
              Download Sample
            </button>
          </div>
        </div>
      </div>

      <button className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium">
        + Tambah Template Baru
        </button>
    </div>
  );
}