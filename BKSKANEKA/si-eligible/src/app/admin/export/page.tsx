// src/app/admin/export/page.tsx
'use client';

import { useState } from 'react';

export default function ExportDataPage() {
  const [loading, setLoading] = useState(false);
  const [selectedJalur, setSelectedJalur] = useState('SNBP');

  const handleExport = async (format: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jalur: selectedJalur,
          format
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export_${selectedJalur}_${format}_${Date.now()}.xlsx`;
        a.click();
      } else {
        alert('Export gagal');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Export Data</h1>
        <p className="text-gray-600">Export data siswa ke berbagai format</p>
      </div>

      <div className="max-w-4xl">
        {/* Jalur Selection */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pilih Jalur Seleksi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['SNBP', 'SNBT', 'SPAN-PTKIN', 'UM-PTKIN'].map((jalur) => (
              <button
                key={jalur}
                onClick={() => setSelectedJalur(jalur)}
                className={`p-4 rounded-xl border-2 transition ${
                  selectedJalur === jalur
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{jalur}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Format Export</h2>
          <div className="space-y-4">
            {/* PDSS SNPMB */}
            <div className="p-6 border border-gray-200 rounded-xl hover:border-purple-400 transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">Format PDSS SNPMB</h3>
                  <p className="text-sm text-gray-600">
                    Export untuk upload ke sistem PDSS SNPMB (SNBP/SNBT)
                  </p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
              <button
                onClick={() => handleExport('pdss_snpmb')}
                disabled={loading || (selectedJalur !== 'SNBP' && selectedJalur !== 'SNBT')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Mengexport...' : 'Download Excel PDSS SNPMB'}
              </button>
            </div>

            {/* SPAN-PTKIN */}
            <div className="p-6 border border-gray-200 rounded-xl hover:border-purple-400 transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">Format SPAN-PTKIN</h3>
                  <p className="text-sm text-gray-600">
                    Export untuk upload ke sistem SPAN-PTKIN
                  </p>
                </div>
                <div className="text-3xl">📗</div>
              </div>
              <button
                onClick={() => handleExport('span_ptkin')}
                disabled={loading || (selectedJalur !== 'SPAN-PTKIN' && selectedJalur !== 'UM-PTKIN')}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Mengexport...' : 'Download Excel SPAN-PTKIN'}
              </button>
            </div>

            {/* Rekap Internal */}
            <div className="p-6 border border-gray-200 rounded-xl hover:border-purple-400 transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">Rekap Internal Sekolah</h3>
                  <p className="text-sm text-gray-600">
                    Export lengkap dengan ranking dan analisis
                  </p>
                </div>
                <div className="text-3xl">📋</div>
              </div>
              <button
                onClick={() => handleExport('internal')}
                disabled={loading}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Mengexport...' : 'Download Rekap Internal'}
              </button>
            </div>

            {/* CSV Format */}
            <div className="p-6 border border-gray-200 rounded-xl hover:border-purple-400 transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">Format CSV</h3>
                  <p className="text-sm text-gray-600">
                    Export dalam format CSV untuk keperluan umum
                  </p>
                </div>
                <div className="text-3xl">📄</div>
              </div>
              <button
                onClick={() => handleExport('csv')}
                disabled={loading}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Mengexport...' : 'Download CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Informasi Export</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>Data yang diexport sesuai dengan jalur yang dipilih</li>
            <li>Hanya siswa yang sudah terverifikasi yang akan diexport</li>
            <li>Format PDSS dan SPAN-PTKIN sudah disesuaikan dengan template resmi</li>
            <li>Rekap internal mencakup ranking dan analisis lengkap</li>
          </ul>
        </div>
      </div>
    </div>
  );
}