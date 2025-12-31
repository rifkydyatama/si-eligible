import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { importDataSiswa } from '../dashboard/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Upload, FileSpreadsheet, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default async function ImportPage() {
  // 1. Cek Session
  const cookieStore = await cookies()
  const adminId = cookieStore.get('admin_session')?.value
  if (!adminId) redirect('/admin/login')

  const admin = await prisma.user.findUnique({ where: { id: parseInt(adminId) } })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Sidebar Navigation */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg border-r border-slate-200 min-h-screen">
          {/* Logo & Brand */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">S</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Si-Eligible</h1>
                <p className="text-xs text-slate-500 uppercase tracking-wider">SMKN 1 Kademangan</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Dashboard</div>

            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="w-5 h-5 rounded bg-slate-200"></div>
              <span>Overview</span>
            </Link>

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-6">Tools</div>

            <Link href="/admin/import" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              <FileSpreadsheet size={20} />
              <span className="font-medium">Import Data</span>
            </Link>

            <Link href="/admin/rebuttals" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <AlertCircle size={20} />
              <span>Approval Sanggahan</span>
            </Link>

            <Link href="/admin/quotas" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="w-5 h-5 rounded bg-slate-200"></div>
              <span>Manajemen Kuota</span>
            </Link>

            <a href="/api/admin/export/snmpb" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="w-5 h-5 rounded bg-slate-200"></div>
              <span>Export SNPMB</span>
            </a>
          </nav>

          {/* User Info */}
          <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {admin?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{admin?.name}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  {admin?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Header */}
          <header className="bg-white border-b border-slate-200 px-8 py-6">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-slate-500 hover:text-slate-700">
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Import Data Siswa</h1>
                <p className="text-slate-600 mt-1">Upload file Excel berisi data nilai siswa untuk proses penjaringan SNBP</p>
              </div>
            </div>
          </header>

          {/* Import Content */}
          <main className="p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Instructions */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <CheckCircle className="text-blue-600" size={24} />
                    Panduan Import Data
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Pastikan file Excel Anda mengikuti format yang benar untuk hasil import yang optimal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-800">Kolom Wajib:</h4>
                      <ul className="space-y-2 text-sm text-blue-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-600" />
                          NISN (Nomor Induk Siswa Nasional)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-600" />
                          NAMA (Nama lengkap siswa)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-600" />
                          JURUSAN (Nama jurusan)
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-800">Kolom Nilai:</h4>
                      <ul className="space-y-2 text-sm text-blue-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-600" />
                          NILAI_MTK (Matematika)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-600" />
                          NILAI_INGGRIS (Bahasa Inggris)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-600" />
                          NILAI_INDO (Bahasa Indonesia)
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Form */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="text-emerald-600" size={24} />
                    Upload File Excel
                  </CardTitle>
                  <CardDescription>
                    Pilih file Excel (.xlsx) yang berisi data siswa dan nilai semester 1-5
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={importDataSiswa} className="space-y-6">
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 hover:bg-slate-100 transition-all duration-200 hover:border-blue-400 group">
                      <input
                          type="file"
                          name="excelFile"
                          accept=".xlsx"
                          required
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-white rounded-full shadow-lg border-2 border-slate-200 group-hover:border-blue-400 transition-colors">
                          <Upload className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-medium text-slate-700">
                            <span className="text-blue-600 hover:underline">Klik untuk memilih file</span> atau drag & drop
                          </p>
                          <p className="text-sm text-slate-500">Format: .xlsx | Maksimal: 10MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                      <AlertCircle className="text-amber-600 h-5 w-5 shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <strong>Penting:</strong> Pastikan format kolom sesuai dengan panduan di atas.
                        Data yang diimport akan menggantikan data sebelumnya dengan NISN yang sama.
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-4">
                      <Button type="submit" size="lg" className="px-8 py-3 text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                        <Upload className="mr-2 h-5 w-5" />
                        Proses Import Data
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Download Template */}
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">Butuh Template?</h3>
                      <p className="text-sm text-slate-600">Download template Excel yang sudah diformat dengan benar</p>
                    </div>
                    <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}