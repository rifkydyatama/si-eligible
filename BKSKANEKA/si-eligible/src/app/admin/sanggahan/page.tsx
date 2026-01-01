// src/app/admin/sanggahan/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Sanggahan {
  id: string;
  siswa: {
    id: string;
    nisn: string;
    nama: string;
    kelas: string;
  };
  semester: number;
  mataPelajaran: string;
  nilaiLama: number;
  nilaiBaru: number;
  buktiRapor: string;
  status: string;
  keterangan: string | null;
  createdAt: string;
}

export default function SanggahanPage() {
  const [sanggahan, setSanggahan] = useState<Sanggahan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedSanggahan, setSelectedSanggahan] = useState<Sanggahan | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSanggahan();
  }, [filter]);

  const fetchSanggahan = async () => {
    try {
      const res = await fetch(`/api/admin/sanggahan?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setSanggahan(data);
      }
    } catch (error) {
      console.error('Error fetching sanggahan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (s: Sanggahan) => {
    setSelectedSanggahan(s);
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedSanggahan) return;

    try {
      const res = await fetch(`/api/admin/sanggahan/${selectedSanggahan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      if (res.ok) {
        alert('Sanggahan disetujui!');
        setShowModal(false);
        fetchSanggahan();
      }
    } catch (error) {
      console.error('Error approving sanggahan:', error);
    }
  };

  const handleReject = async (keterangan: string) => {
    if (!selectedSanggahan) return;

    try {
      const res = await fetch(`/api/admin/sanggahan/${selectedSanggahan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', keterangan })
      });

      if (res.ok) {
        alert('Sanggahan ditolak!');
        setShowModal(false);
        fetchSanggahan();
      }
    } catch (error) {
      console.error('Error rejecting sanggahan:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sanggahan Nilai</h1>
        <p className="text-gray-600">Review dan approve sanggahan nilai dari siswa</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 mb-6 overflow-hidden">
        <div className="flex">
          {[
            { value: 'pending', label: 'Pending', color: 'yellow' },
            { value: 'approved', label: 'Disetujui', color: 'green' },
            { value: 'rejected', label: 'Ditolak', color: 'red' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-1 px-6 py-4 font-medium text-sm transition ${
                filter === tab.value
                  ? `bg-${tab.color}-50 text-${tab.color}-600 border-b-2 border-${tab.color}-600`
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sanggahan List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Memuat data...</p>
        </div>
      ) : sanggahan.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600">Tidak ada sanggahan dengan status: {filter}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sanggahan.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                      {s.siswa.nama.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{s.siswa.nama}</h3>
                      <p className="text-sm text-gray-600">
                        {s.siswa.nisn} • Kelas {s.siswa.kelas}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Mata Pelajaran</p>
                      <p className="font-medium text-gray-800">{s.mataPelajaran}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Semester</p>
                      <p className="font-medium text-gray-800">{s.semester}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nilai Lama</p>
                      <p className="font-medium text-red-600">{s.nilaiLama}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nilai Baru (Klaim)</p>
                      <p className="font-medium text-green-600">{s.nilaiBaru}</p>
                    </div>
                  </div>

                  {s.keterangan && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Keterangan:</p>
                      <p className="text-sm text-gray-700">{s.keterangan}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Diajukan: {new Date(s.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="ml-4">
                  {s.status === 'pending' ? (
                    <button
                      onClick={() => handleReview(s)}
                      className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium"
                    >
                      Review
                    </button>
                  ) : (
                    <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                      s.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {s.status === 'approved' ? '✓ Disetujui' : '✗ Ditolak'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Review */}
      {showModal && selectedSanggahan && (
        <ReviewModal
          sanggahan={selectedSanggahan}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function ReviewModal({
  sanggahan,
  onApprove,
  onReject,
  onClose
}: {
  sanggahan: Sanggahan;
  onApprove: () => void;
  onReject: (keterangan: string) => void;
  onClose: () => void;
}) {
  const [keterangan, setKeterangan] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Review Sanggahan</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>

          {/* Siswa Info */}
          <div className="bg-purple-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {sanggahan.siswa.nama.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{sanggahan.siswa.nama}</h3>
                <p className="text-gray-600">
                  NISN: {sanggahan.siswa.nisn} • Kelas {sanggahan.siswa.kelas}
                </p>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
              <h3 className="font-semibold text-red-800 mb-4">Nilai di Sistem</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Mata Pelajaran</p>
                  <p className="text-lg font-bold text-gray-800">{sanggahan.mataPelajaran}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Semester</p>
                  <p className="text-lg font-bold text-gray-800">{sanggahan.semester}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nilai</p>
                  <p className="text-4xl font-bold text-red-600">{sanggahan.nilaiLama}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl">
              <h3 className="font-semibold text-green-800 mb-4">Nilai Klaim Siswa</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Mata Pelajaran</p>
                  <p className="text-lg font-bold text-gray-800">{sanggahan.mataPelajaran}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Semester</p>
                  <p className="text-lg font-bold text-gray-800">{sanggahan.semester}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nilai</p>
                  <p className="text-4xl font-bold text-green-600">{sanggahan.nilaiBaru}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bukti Rapor */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Bukti Foto Rapor</h3>
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
              <img
                src={sanggahan.buktiRapor}
                alt="Bukti Rapor"
                className="w-full h-auto"
              />
            </div>
            
            <a
              href={sanggahan.buktiRapor}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              🔍 Buka gambar di tab baru
            </a>
          </div>

          {/* Action Buttons */}
          {!showRejectForm ? (
            <div className="flex gap-4">
              <button
                onClick={onApprove}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold text-lg"
              >
                ✓ Setujui Sanggahan
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-lg"
              >
                ✗ Tolak Sanggahan
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alasan Penolakan
              </label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Tuliskan alasan penolakan..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (keterangan.trim()) {
                      onReject(keterangan);
                    } else {
                      alert('Alasan penolakan harus diisi');
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
                >
                  Kirim Penolakan
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}