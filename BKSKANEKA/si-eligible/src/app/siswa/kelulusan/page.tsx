'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Kampus {
  id: string;
  namaKampus: string;
  jenisKampus: string;
  provinsi: string;
  kota: string;
}

interface Jurusan {
  id: string;
  namaJurusan: string;
  jenjang: string;
  fakultas: string;
  akreditasi?: string;
  kampus: {
    id: string;
    namaKampus: string;
  };
}

interface Kelulusan {
  id: string;
  status: string;
  jalur: string;
  buktiPenerimaan: string;
  kampus: {
    id: string;
    namaKampus: string;
    jenisKampus: string;
    provinsi: string;
    kota: string;
  };
  jurusan: {
    id: string;
    namaJurusan: string;
    jenjang: string;
    fakultas: string;
    akreditasi?: string;
  };
}

export default function KelulusanPage() {
  const { data: session } = useSession();
  const [kelulusan, setKelulusan] = useState<Kelulusan | null>(null);
  const [kampus, setKampus] = useState<Kampus[]>([]);
  const [jurusan, setJurusan] = useState<Jurusan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    status: '',
    kampusId: '',
    jurusanId: '',
    jalur: 'SNMPTN',
    buktiPenerimaan: null as File | null
  });

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch current kelulusan
      const kelulusanRes = await fetch('/api/siswa/kelulusan');
      if (kelulusanRes.ok) {
        const kelulusanData = await kelulusanRes.json();
        setKelulusan(kelulusanData);

        if (kelulusanData) {
          setFormData({
            status: kelulusanData.status,
            kampusId: kelulusanData.kampus.id,
            jurusanId: kelulusanData.jurusan.id,
            jalur: kelulusanData.jalur,
            buktiPenerimaan: null
          });
        }
      }

      // Fetch available kampus
      const kampusRes = await fetch('/api/konfigurasi/kampus');
      if (kampusRes.ok) {
        const kampusData = await kampusRes.json();
        setKampus(kampusData);
      }

      // Fetch available jurusan
      const jurusanRes = await fetch('/api/konfigurasi/jurusan');
      if (jurusanRes.ok) {
        const jurusanData = await jurusanRes.json();
        setJurusan(jurusanData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.status) {
      alert('Status kelulusan wajib dipilih');
      return;
    }

    if (formData.status === 'lulus') {
      if (!formData.kampusId || !formData.jurusanId) {
        alert('Kampus dan jurusan wajib dipilih untuk status lulus');
        return;
      }
      if (!formData.buktiPenerimaan && !kelulusan?.buktiPenerimaan) {
        alert('Bukti penerimaan wajib diupload untuk status lulus');
        return;
      }
    }

    setSaving(true);
    try {
      const submitData = new FormData();
      submitData.append('status', formData.status);
      submitData.append('jalur', formData.jalur);

      if (formData.status === 'lulus') {
        submitData.append('kampusId', formData.kampusId);
        submitData.append('jurusanId', formData.jurusanId);
      }

      if (formData.buktiPenerimaan) {
        submitData.append('buktiPenerimaan', formData.buktiPenerimaan);
      }

      const res = await fetch('/api/siswa/kelulusan', {
        method: 'POST',
        body: submitData
      });

      if (res.ok) {
        alert('Laporan kelulusan berhasil disimpan!');
        fetchData(); // Refresh data
      } else {
        const error = await res.json();
        alert(`Gagal menyimpan: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving kelulusan:', error);
      alert('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan kelulusan?')) {
      return;
    }

    try {
      const res = await fetch('/api/siswa/kelulusan', {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Laporan kelulusan berhasil dihapus!');
        setKelulusan(null);
        setFormData({
          status: '',
          kampusId: '',
          jurusanId: '',
          jalur: 'SNMPTN',
          buktiPenerimaan: null
        });
      } else {
        const error = await res.json();
        alert(`Gagal menghapus: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting kelulusan:', error);
      alert('Terjadi kesalahan saat menghapus');
    }
  };

  const getFilteredJurusan = (kampusId: string) => {
    return jurusan.filter(j => j.kampus.id === kampusId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Lapor Kelulusan</h1>
        <p className="text-gray-600">Laporkan status kelulusan dan upload bukti penerimaan kampus</p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Petunjuk Pelaporan Kelulusan</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Pilih status kelulusan Anda (Lulus/Tidak Lulus)</li>
          <li>Jika lulus, pilih kampus dan jurusan tujuan serta upload bukti penerimaan</li>
          <li>Bukti penerimaan dapat berupa surat penerimaan, SK kelulusan, atau dokumen resmi lainnya</li>
          <li>Data ini akan digunakan untuk statistik dan verifikasi kelulusan</li>
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Form Laporan Kelulusan</h2>
          {kelulusan && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Hapus Laporan
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Status Kelulusan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status Kelulusan <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="lulus"
                  checked={formData.status === 'lulus'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mr-2"
                />
                <span className="text-green-600 font-medium">Lulus - Diterima di Perguruan Tinggi</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="tidak_lulus"
                  checked={formData.status === 'tidak_lulus'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mr-2"
                />
                <span className="text-red-600 font-medium">Tidak Lulus - Tidak diterima di Perguruan Tinggi</span>
              </label>
            </div>
          </div>

          {/* Conditional fields for lulus status */}
          {formData.status === 'lulus' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jalur Masuk <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jalur}
                  onChange={(e) => setFormData({...formData, jalur: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="SNMPTN">SNMPTN</option>
                  <option value="SBMPTN">SBMPTN</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kampus Tujuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kampusId}
                  onChange={(e) => setFormData({...formData, kampusId: e.target.value, jurusanId: ''})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Pilih Kampus</option>
                  {kampus.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaKampus} - {k.kota}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jurusan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jurusanId}
                  onChange={(e) => setFormData({...formData, jurusanId: e.target.value})}
                  disabled={!formData.kampusId}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                >
                  <option value="">Pilih Jurusan</option>
                  {getFilteredJurusan(formData.kampusId).map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.namaJurusan} ({j.jenjang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Bukti Penerimaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFormData({...formData, buktiPenerimaan: e.target.files?.[0] || null})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, PDF (Max 5MB)</p>
                {kelulusan?.buktiPenerimaan && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Bukti sudah diupload sebelumnya
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Laporan Kelulusan'}
          </button>
        </form>
      </div>

      {/* Current Kelulusan Status */}
      {kelulusan && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Status Kelulusan Anda</h3>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-purple-800 text-lg">
                    Status: {kelulusan.status === 'lulus' ? '🎓 Lulus' : '❌ Tidak Lulus'}
                  </p>
                  {kelulusan.status === 'lulus' && (
                    <>
                      <p className="text-purple-600">{kelulusan.kampus.namaKampus}</p>
                      <p className="text-purple-600">{kelulusan.jurusan.namaJurusan} ({kelulusan.jurusan.jenjang})</p>
                      <p className="text-sm text-gray-600">Jalur: {kelulusan.jalur}</p>
                      <p className="text-sm text-green-600">✓ Bukti penerimaan telah diupload</p>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    kelulusan.status === 'lulus'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {kelulusan.status === 'lulus' ? 'Lulus' : 'Tidak Lulus'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}