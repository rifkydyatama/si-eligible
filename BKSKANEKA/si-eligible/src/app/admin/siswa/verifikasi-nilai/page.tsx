// src/app/admin/siswa/verifikasi-nilai/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Nilai {
  id: string;
  semester: number;
  mataPelajaran: string;
  nilai: number;
  isVerified: boolean;
  siswa: {
    nama: string;
    nisn: string;
  };
}

export default function AdminVerifikasiNilaiPage() {
  const { data: session } = useSession();
  const [nilai, setNilai] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchNilai();
    }
  }, [session]);

  const fetchNilai = async () => {
    try {
      const res = await fetch(`/api/admin/nilai?unverifiedOnly=true`);
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
      const res = await fetch(`/api/admin/nilai/${nilaiId}/verify`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchNilai();
      }
    } catch (error) {
      console.error('Error verifying nilai:', error);
    }
  };

  // Group by student and semester
  const groupedNilai = nilai.reduce((acc, n) => {
    const key = `${n.siswa.nisn}-${n.semester}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {} as Record<string, Nilai[]>);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Verifikasi Nilai Siswa</h1>
        <p className="text-gray-600">Periksa dan verifikasi nilai rapor siswa yang belum terverifikasi</p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">📌 Petunjuk</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Periksa setiap nilai rapor siswa yang belum terverifikasi</li>
          <li>Klik &quot;Verifikasi&quot; jika nilai sudah benar</li>
          <li>Nilai yang sudah diverifikasi akan digunakan untuk perhitungan ranking</li>
        </ul>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : nilai.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Semua Nilai Sudah Terverifikasi</h3>
          <p className="text-gray-600">Tidak ada nilai yang perlu diverifikasi saat ini.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNilai).map(([key, nilaiList]) => {
            const firstNilai = nilaiList[0];
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-purple-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">{firstNilai.siswa.nama}</h2>
                      <p className="text-sm text-gray-600">NISN: {firstNilai.siswa.nisn} | Semester {firstNilai.semester}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                      {nilaiList.length} nilai belum verifikasi
                    </span>
                  </div>
                </div>
                <div className="p-6">
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
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {nilaiList.map((n) => (
                          <tr key={n.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm text-gray-800">{n.mataPelajaran}</td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-2xl font-bold text-purple-600">{n.nilai}</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleVerify(n.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium"
                                >
                                  ✓ Verifikasi
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
