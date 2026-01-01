// src/app/siswa/verifikasi-nilai/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Nilai {
  id: string;
  semester: number;
  mataPelajaran: string;
  nilai: number;
  isVerified: boolean;
}

export default function VerifikasiNilaiPage() {
  const { data: session } = useSession();
  const [nilai, setNilai] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSanggahModal, setShowSanggahModal] = useState(false);
  const [selectedNilai, setSelectedNilai] = useState<Nilai | null>(null);

  useEffect(() => {
    if (session?.user?.userId) {
      fetchNilai();
    }
  }, [session]);

  const fetchNilai = async () => {
    try {
      const res = await fetch(`/api/siswa/nilai`);
      if (res.ok) {
        const data = await res.json();
        setNilai(data);
      }
    } catch (error) {
      console.error('Error fetching nilai:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (nilaiId: string) => {
    try {
      const res = await fetch(`/api/siswa/nilai/${nilaiId}/verify`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchNilai();
      }
    } catch (error) {
      console.error('Error verifying nilai:', error);
    }
  };

  const handleSanggah = (n: Nilai) => {
    setSelectedNilai(n);
    setShowSanggahModal(true);
  };

  // Group by semester
  const groupedNilai = nilai.reduce((acc, n) => {
    if (!acc[n.semester]) acc[n.semester] = [];
    acc[n.semester].push(n);
    return acc;
  }, {} as Record<number, Nilai[]>);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Verifikasi Nilai</h1>
        <p className="text-gray-600">Periksa dan verifikasi nilai rapor Anda</p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">📌 Petunjuk</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Periksa setiap nilai rapor Anda per semester</li>
          <li>Klik <strong>"Sesuai"</strong> jika nilai sudah benar</li>
          <li>Klik <strong>"Sanggah"</strong> jika ada nilai yang salah (wajib upload foto rapor)</li>
          <li>Nilai yang sudah diverifikasi akan digunakan untuk perhitungan ranking</li>
        </ul>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((sem) => (
            <div key={sem} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-purple-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">Semester {sem}</h2>
              </div>
              <div className="p-6">
                {!groupedNilai[sem] || groupedNilai[sem].length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Tidak ada data nilai</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Mata Pelajaran
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            Nilai
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {groupedNilai[sem].map((n) => (
                          <tr key={n.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm text-gray-800">{n.mataPelajaran}</td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-2xl font-bold text-purple-600">{n.nilai}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              {n.isVerified ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                                  ✓ Terverifikasi
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
                                  Belum Verifikasi
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2 justify-center">
                                {!n.isVerified && (
                                  <>
                                    <button
                                      onClick={() => handleVerify(n.id)}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium"
                                    >
                                      Sesuai
                                    </button>
                                    <button
                                      onClick={() => handleSanggah(n)}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs font-medium"
                                    >
                                      Sanggah
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sanggah Modal */}
      {showSanggahModal && selectedNilai && (
        <SanggahModal
          nilai={selectedNilai}
          onClose={() => {
            setShowSanggahModal(false);
            setSelectedNilai(null);
          }}
          onSuccess={() => {
            setShowSanggahModal(false);
            setSelectedNilai(null);
            fetchNilai();
          }}
        />
      )}
    </div>
  );
}

function SanggahModal({
  nilai,
  onClose,
  onSuccess
}: {
  nilai: Nilai;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [nilaiBaru, setNilaiBaru] = useState(nilai.nilai.toString());
  const [buktiRapor, setBuktiRapor] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buktiRapor) {
      alert('Upload foto rapor wajib diisi!');
      return;
    }

    setLoading(true);

    try {
      // Upload foto (dummy, seharusnya upload ke storage)
      const formData = new FormData();
      formData.append('file', buktiRapor);
      formData.append('nilaiId', nilai.id);
      formData.append('nilaiBaru', nilaiBaru);

      const res = await fetch('/api/siswa/sanggahan', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert('Sanggahan berhasil diajukan!');
        onSuccess();
      } else {
        alert('Gagal mengajukan sanggahan');
      }
    } catch (error) {
      console.error('Error submitting sanggahan:', error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Ajukan Sanggahan</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700">
                <strong>Perhatian:</strong> Pastikan nilai baru sesuai dengan rapor Anda. Sanggahan yang salah dapat mempengaruhi eligibilitas Anda.
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Mata Pelajaran</p>
              <p className="text-lg font-bold text-gray-800">{nilai.mataPelajaran}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Semester</p>
              <p className="text-lg font-bold text-gray-800">{nilai.semester}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nilai di Sistem
              </label>
              <div className="text-3xl font-bold text-red-600">{nilai.nilai}</div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nilai yang Benar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={nilaiBaru}
                onChange={(e) => setNilaiBaru(e.target.value)}
                required
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-2xl font-bold text-green-600 text-center"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Foto Rapor <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBuktiRapor(e.target.files?.[0] || null)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (Max 5MB)</p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Mengirim...' : 'Ajukan Sanggahan'}
              </button>
              <button
                type="button"
                onClick={onClose}
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