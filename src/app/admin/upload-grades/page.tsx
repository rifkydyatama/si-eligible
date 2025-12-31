import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Calculator
} from 'lucide-react'
import Link from 'next/link'

export default async function UploadGradesPage() {
  // 1. Cek Session
  const cookieStore = await cookies()
  const adminId = cookieStore.get('admin_session')?.value
  if (!adminId) redirect('/admin/login')

  // 2. Data Fetching
  const admin = await prisma.user.findUnique({ where: { id: parseInt(adminId) } })

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

              <Link href="/admin/upload-grades" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-md">
                <FileText size={20} />
                <span className="font-medium">Upload Nilai</span>
              </Link>

              <Link href="/admin/upload-majors" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                <School size={20} />
                <span>Upload Jurusan</span>
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
                <h1 className="text-3xl font-bold text-slate-800">Upload Data Nilai</h1>
                <p className="text-slate-600 mt-1">Upload nilai rapor siswa untuk perhitungan ranking SNBP</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download size={16} />
                  Template Excel
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="px-8 py-6">
            {/* Upload Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator size={24} />
                  Upload File Nilai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <FileSpreadsheet className="h-4 w-4" />
                    <AlertDescription>
                      Format Excel harus memiliki kolom NISN dan nilai mata pelajaran per semester.
                      Sistem akan otomatis menghitung rata-rata dan ranking.
                      <a href="#" className="text-blue-600 hover:underline ml-1">Download template</a>
                    </AlertDescription>
                  </Alert>

                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="semester">Semester</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Semester 1</SelectItem>
                            <SelectItem value="2">Semester 2</SelectItem>
                            <SelectItem value="3">Semester 3</SelectItem>
                            <SelectItem value="4">Semester 4</SelectItem>
                            <SelectItem value="5">Semester 5</SelectItem>
                            <SelectItem value="6">Semester 6</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="tahun">Tahun Ajaran</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tahun ajaran" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2024-2025">2024-2025</SelectItem>
                            <SelectItem value="2023-2024">2023-2024</SelectItem>
                            <SelectItem value="2022-2023">2022-2023</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="file">Pilih File Excel</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".xlsx,.xls"
                          className="mt-1"
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button type="submit" className="flex items-center gap-2">
                          <Upload size={16} />
                          Upload & Hitung
                        </Button>
                        <Button type="button" variant="outline">
                          Clear
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={24} />
                  Preview Data Nilai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <Calculator size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium">Belum ada data nilai untuk dipreview</p>
                  <p className="text-sm">Upload file Excel nilai terlebih dahulu untuk melihat preview dan perhitungan ranking</p>
                </div>

                {/* Preview Table (will be shown after upload) */}
                <div className="hidden">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-slate-600">
                        Total data: <span className="font-semibold">0 siswa</span> |
                        Rata-rata tertinggi: <span className="font-semibold text-green-600">0.00</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Trash2 size={14} className="mr-1" />
                        Clear All
                      </Button>
                      <Button size="sm">
                        <CheckCircle2 size={14} className="mr-1" />
                        Simpan & Hitung Ranking
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b">NISN</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b">Nama</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b">Mata Pelajaran</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b">Nilai</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b">Rata-rata</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 border-b">Ranking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Data rows will be populated here */}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}