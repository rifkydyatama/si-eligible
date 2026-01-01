// src/app/admin/nilai/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DataNilaiPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Pilih file Excel terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/nilai/import', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Import gagal');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `NISN,Semester,Mata Pelajaran,Nilai
0012345678,1,Matematika,85
0012345678,1,Bahasa Indonesia,88
0012345678,1,Bahasa Inggris,82`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_nilai.csv';
    a.click();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Import Data Nilai</h1>
        <p className="text-gray-600">Upload file Excel untuk menambahkan nilai rapor siswa</p>
      </div>

      <div className="max-w-4xl">
        {/* Instructions */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-800 mb-3">📋 Format Import Nilai</h2>
          <div className="text-sm text-purple-700 space-y-2">
            <p><strong>Kolom yang diperlukan:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>NISN (10 digit)</li>
              <li>Semester (1-5)</li>
              <li>Mata Pelajaran</li>
              <li>Nilai (0-100)</li>
            </ul>
            <p className="mt-3"><strong>Catatan:</strong> Jika NISN sudah memiliki nilai untuk mata pelajaran & semester yang sama, nilai akan diupdate.</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition text-sm font-medium"
          >
            📥 Download Template
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="nilai-file-upload"
            />
            <label htmlFor="nilai-file-upload" className="cursor-pointer">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-700 font-medium mb-2">
                {file ? file.name : 'Klik untuk pilih file atau drag & drop'}
              </p>
              <p className="text-sm text-gray-500">
                Format: .xlsx, .xls, .csv (Maks. 10MB)
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Hapus
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-semibold text-green-800 mb-3">✅ Import Selesai!</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Berhasil</p>
                  <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">NISN Tidak Ditemukan</p>
                  <p className="text-2xl font-bold text-yellow-600">{result.notFoundCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Baris</p>
                  <p className="text-2xl font-bold text-gray-600">{result.totalRows}</p>
                </div>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-red-700 mb-2">Error:</p>
                  <ul className="list-disc list-inside text-xs text-red-600 max-h-40 overflow-y-auto">
                    {result.errors.map((err: string, idx: number) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Mengimport...
                </span>
              ) : (
                'Upload & Import'
              )}
            </button>
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-center"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}