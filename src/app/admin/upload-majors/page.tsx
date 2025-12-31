import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Users,
  School,
  BarChart3,
  Target,
  FileText,
  UserCheck,
  Award,
  LogOut,
  Eye,
  Trash2,
  Plus,
  Edit,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export default async function UploadMajorsPage() {
  // 1. Cek Session
  const cookieStore = await cookies()
  const adminId = cookieStore.get('admin_session')?.value
  if (!adminId) redirect('/admin/login')

  // 2. Data Fetching
  const admin = await prisma.user.findUnique({ where: { id: parseInt(adminId) } })
  const majors = await prisma.major.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg border-r border-slate-200 min-h-screen">
          {/* Logo & Brand */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <School size={24} className="text-white" />
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

            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
              <BarChart3 size={20} />
              <span>Overview</span>
            </Link>

            <div className="pt-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Data Management</div>

              <Link href="/admin/students" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                <Users size={20} />
                <span>Manajemen Siswa</span>
              </Link>

              <Link href="/admin/upload-students" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                <UserCheck size={20} />
                <span>Upload Siswa</span>
              </Link>

              <Link href="/admin/upload-grades" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                <FileText size={20} />
                <span>Upload Nilai</span>
              </Link>

              <Link href="/admin/upload-majors" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-md">
                <School size={20} />
                <span className="font-medium">Upload Jurusan</span>
              </Link>

              <Link href="/admin/eligible-management" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                <Award size={20} />
                <span>Kelola Eligible</span>
              </Link>
            </div>

            <div className="pt-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Approval & Quota</div>

              <Link href="/admin/rebuttals" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                <AlertCircle size={20} />
                <span>Approval Sanggahan</span>
              </Link>

              <Link href="/admin/quotas" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                <Target size={20} />
                <span>Manajemen Kuota</span>
              </Link>
            </div>

            <div className="pt-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Tools</div>

              <a href="/api/admin/export/snmpb" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                <Download size={20} />
                <span>Export SNPMB</span>
              </a>

              <Link href="/admin/import" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                <FileText size={20} />
                <span>Import Data</span>
              </Link>
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
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
            <Button variant="outline" size="sm" className="w-full text-slate-600 border-slate-300 hover:bg-slate-100">
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Header */}
          <header className="bg-white border-b border-slate-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Manajemen Jurusan</h1>
                <p className="text-slate-600 mt-1">Kelola jurusan dan kuota untuk sistem penjaringan SNBP</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download size={16} />
                  Template Excel
                </Button>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Tambah Jurusan
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="px-8 py-6">
            {/* Add Major Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={24} />
                  Tambah Jurusan Baru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="majorName">Nama Jurusan</Label>
                    <Input
                      id="majorName"
                      placeholder="Contoh: Teknik Komputer Jaringan"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quotaCount">Kuota SNBP</Label>
                    <Input
                      id="quotaCount"
                      type="number"
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quotaPercentage">Persentase Kuota (%)</Label>
                    <Input
                      id="quotaPercentage"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-3 flex gap-4">
                    <Button type="submit" className="flex items-center gap-2">
                      <Plus size={16} />
                      Tambah Jurusan
                    </Button>
                    <Button type="button" variant="outline">
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={24} />
                  Upload Jurusan Massal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <FileSpreadsheet className="h-4 w-4" />
                    <AlertDescription>
                      Upload file Excel dengan kolom: Nama Jurusan, Kuota, Persentase Kuota.
                      <a href="#" className="text-blue-600 hover:underline ml-1">Download template</a>
                    </AlertDescription>
                  </Alert>

                  <form className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="file">Pilih File Excel</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".xlsx,.xls"
                        className="mt-1"
                      />
                    </div>

                    <Button type="submit" className="flex items-center gap-2">
                      <Upload size={16} />
                      Upload
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Majors List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={24} />
                  Daftar Jurusan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Nama Jurusan</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Kuota SNBP</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Persentase (%)</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Siswa Terdaftar</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {majors.map((major: any) => (
                        <tr key={major.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{major.name}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{major.quotaCount}</td>
                          <td className="py-3 px-4 text-slate-600">{major.quotaPercentage}%</td>
                          <td className="py-3 px-4 text-slate-600">0 siswa</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit size={14} />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {majors.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <School size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Belum ada jurusan terdaftar</p>
                    <p className="text-sm">Tambah jurusan baru untuk memulai konfigurasi kuota</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}