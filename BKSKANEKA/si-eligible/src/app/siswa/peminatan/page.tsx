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

interface Peminatan {
  id: string;
  pilihan: number;
  jalur: string;
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

export default function PeminatanPage() {
  const { data: session } = useSession();
  const [peminatan, setPeminatan] = useState<Peminatan[]>([]);
  const [kampus, setKampus] = useState<Kampus[]>([]);
  const [jurusan, setJurusan] = useState<Jurusan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for each pilihan
  const [pilihan1, setPilihan1] = useState({
    kampusId: '',
    jurusanId: '',
    jalur: 'SNMPTN'
  });
  const [pilihan2, setPilihan2] = useState({
    kampusId: '',
    jurusanId: '',
    jalur: 'SNMPTN'
  });

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch current peminatan
      const peminatanRes = await fetch('/api/siswa/peminatan');
      if (peminatanRes.ok) {
        const peminatanData = await peminatanRes.json();
        setPeminatan(peminatanData);

        // Populate form with existing data
        const pilihan1Data = peminatanData.find((p: Peminatan) => p.pilihan === 1);
        const pilihan2Data = peminatanData.find((p: Peminatan) => p.pilihan === 2);

        if (pilihan1Data) {
          setPilihan1({
            kampusId: pilihan1Data.kampus.id,
            jurusanId: pilihan1Data.jurusan.id,
            jalur: pilihan1Data.jalur
          });
        }

        if (pilihan2Data) {
          setPilihan2({
            kampusId: pilihan2Data.kampus.id,
            jurusanId: pilihan2Data.jurusan.id,
            jalur: pilihan2Data.jalur
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

  const handleSave = async (pilihanNum: number) => {
    const pilihanData = pilihanNum === 1 ? pilihan1 : pilihan2;

    if (!pilihanData.kampusId || !pilihanData.jurusanId) {
      alert('Pilih kampus dan jurusan terlebih dahulu');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/siswa/peminatan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...pilihanData,
          pilihan: pilihanNum
        })
      });

      if (res.ok) {
        alert(`Pilihan ${pilihanNum} berhasil disimpan!`);
        fetchData(); // Refresh data
      } else {
        const error = await res.json();
        alert(`Gagal menyimpan: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving peminatan:', error);
      alert('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pilihanNum: number) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Pilihan ${pilihanNum}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/siswa/peminatan?pilihan=${pilihanNum}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert(`Pilihan ${pilihanNum} berhasil dihapus!`);
        // Reset form
        if (pilihanNum === 1) {
          setPilihan1({ kampusId: '', jurusanId: '', jalur: 'SNMPTN' });
        } else {
          setPilihan2({ kampusId: '', jurusanId: '', jalur: 'SNMPTN' });
        }
        fetchData(); // Refresh data
      } else {
        const error = await res.json();
        alert(`Gagal menghapus: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting peminatan:', error);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Peminatan Kampus</h1>
        <p className="text-gray-600">Pilih kampus dan jurusan tujuan Anda untuk program beasiswa</p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">📌 Petunjuk Peminatan</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Anda dapat memilih maksimal 2 pilihan kampus dan jurusan</li>
          <li>Pilihan 1 adalah prioritas utama, Pilihan 2 sebagai alternatif</li>
          <li>Pastikan data yang dipilih sesuai dengan minat dan kemampuan Anda</li>
          <li>Data peminatan akan digunakan untuk proses seleksi beasiswa</li>
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pilihan 1 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Pilihan 1</h2>
            {peminatan.find(p => p.pilihan === 1) && (
              <button
                onClick={() => handleDelete(1)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Hapus
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jalur Masuk <span className="text-red-500">*</span>
              </label>
              <select
                value={pilihan1.jalur}
                onChange={(e) => setPilihan1({...pilihan1, jalur: e.target.value})}
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
                Kampus <span className="text-red-500">*</span>
              </label>
              <select
                value={pilihan1.kampusId}
                onChange={(e) => setPilihan1({...pilihan1, kampusId: e.target.value, jurusanId: ''})}
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
                value={pilihan1.jurusanId}
                onChange={(e) => setPilihan1({...pilihan1, jurusanId: e.target.value})}
                disabled={!pilihan1.kampusId}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              >
                <option value="">Pilih Jurusan</option>
                {getFilteredJurusan(pilihan1.kampusId).map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.namaJurusan} ({j.jenjang})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleSave(1)}
              disabled={saving}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pilihan 1'}
            </button>
          </div>
        </div>

        {/* Pilihan 2 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Pilihan 2</h2>
            {peminatan.find(p => p.pilihan === 2) && (
              <button
                onClick={() => handleDelete(2)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Hapus
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jalur Masuk <span className="text-red-500">*</span>
              </label>
              <select
                value={pilihan2.jalur}
                onChange={(e) => setPilihan2({...pilihan2, jalur: e.target.value})}
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
                Kampus <span className="text-red-500">*</span>
              </label>
              <select
                value={pilihan2.kampusId}
                onChange={(e) => setPilihan2({...pilihan2, kampusId: e.target.value, jurusanId: ''})}
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
                value={pilihan2.jurusanId}
                onChange={(e) => setPilihan2({...pilihan2, jurusanId: e.target.value})}
                disabled={!pilihan2.kampusId}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              >
                <option value="">Pilih Jurusan</option>
                {getFilteredJurusan(pilihan2.kampusId).map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.namaJurusan} ({j.jenjang})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleSave(2)}
              disabled={saving}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pilihan 2'}
            </button>
          </div>
        </div>
      </div>

      {/* Current Peminatan Summary */}
      {peminatan.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Peminatan Anda Saat Ini</h3>
          <div className="space-y-3">
            {peminatan.map((p) => (
              <div key={p.id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-purple-800 text-lg">{p.kampus.namaKampus}</p>
                    <p className="text-purple-600">{p.jurusan.namaJurusan} ({p.jurusan.jenjang})</p>
                    <p className="text-sm text-gray-600">Jalur: {p.jalur}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                      Pilihan {p.pilihan}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}