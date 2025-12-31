import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Search,
  Filter,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  School,
  BarChart3,
  Target,
  FileText,
  UserCheck,
  Download,
  LogOut,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  UserX,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'

export default async function EligibleManagementPage() {
  // 1. Cek Session
  const cookieStore = await cookies()
  const adminId = cookieStore.get('admin_session')?.value
  if (!adminId) redirect('/admin/login')

  // 2. Data Fetching
  const admin = await prisma.user.findUnique({ where: { id: parseInt(adminId) } })

  const eligibleStudents = await prisma.student.findMany({
    where: { isEligible: true },
    include: {
      major: true,
      rebuttals: {
        where: { status: 'APPROVED' },
        select: { id: true }
      }
    },
    orderBy: [
      { major: { name: 'asc' } },
      { averageScore: 'desc' }
    ]
  })

  const waitingListStudents = await prisma.student.findMany({
    where: {
      isEligible: false,
      dataStatus: 'VERIFIED'
    },
    include: { major: true },
    orderBy: { averageScore: 'desc' },
    take: 20
  })

  const majors = await prisma.major.findMany({ orderBy: { name: 'asc' } })

  // Calculate stats
  const totalEligible = eligibleStudents.length
  const totalWaiting = waitingListStudents.length
  const majorStats = majors.map((major: any) => ({
    ...major,
    eligibleCount: eligibleStudents.filter((s: any) => s.majorId === major.id).length,
    quotaUsed: Math.round((eligibleStudents.filter((s: any) => s.majorId === major.id).length / major.quotaCount) * 100)
  }))

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

              <Link href="/admin/upload-majors" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                <School size={20} />
                <span>Upload Jurusan</span>
              </Link>

              <Link href="/admin/eligible-management" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-md">
                <Award size={20} />
                <span className="font-medium">Kelola Eligible</span>
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
                <h1 className="text-3xl font-bold text-slate-800">Kelola Siswa Eligible</h1>
                <p className="text-slate-600 mt-1">Pantau dan kelola siswa yang eligible SNBP, ganti siswa yang mengundurkan diri</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw size={16} />
                  Refresh Data
                </Button>
                <Button className="flex items-center gap-2">
                  <Download size={16} />
                  Export Eligible
                </Button>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Eligible</p>
                      <p className="text-3xl font-bold">{totalEligible}</p>
                    </div>
                    <Award size={32} className="text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Waiting List</p>
                      <p className="text-3xl font-bold">{totalWaiting}</p>
                    </div>
                    <Users size={32} className="text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Quota Terpakai</p>
                      <p className="text-3xl font-bold">
                        {majorStats.reduce((sum: number, m: any) => sum + m.quotaUsed, 0) / majorStats.length || 0}%
                      </p>
                    </div>
                    <Target size={32} className="text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Dengan Sanggahan</p>
                      <p className="text-3xl font-bold">
                        {eligibleStudents.filter((s: any) => s.rebuttals.length > 0).length}
                      </p>
                    </div>
                    <AlertCircle size={32} className="text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Major Quota Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Status Kuota per Jurusan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {majorStats.map((major: any) => (
                    <div key={major.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-slate-800">{major.name}</h3>
                        <Badge variant={major.quotaUsed >= 100 ? "destructive" : major.quotaUsed >= 80 ? "secondary" : "default"}>
                          {major.quotaUsed}%
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        {major.eligibleCount} / {major.quotaCount} siswa
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            major.quotaUsed >= 100 ? 'bg-red-500' :
                            major.quotaUsed >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(major.quotaUsed, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Eligible Students Table */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award size={24} />
                  Daftar Siswa Eligible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                      <Input
                        placeholder="Cari siswa eligible..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter jurusan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jurusan</SelectItem>
                      {majors.map((major: any) => (
                        <SelectItem key={major.id} value={major.id.toString()}>{major.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Nama</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">NISN</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Jurusan</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Ranking Score</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eligibleStudents.map((student: any) => (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{student.name}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{student.nisn}</td>
                          <td className="py-3 px-4 text-slate-600">{student.major?.name}</td>
                          <td className="py-3 px-4 text-slate-600">{student.averageScore?.toFixed(2) || '0.00'}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle2 size={12} className="mr-1" />
                              Eligible
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <UserX size={14} className="mr-1" />
                                Undurkan
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Waiting List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={24} />
                  Waiting List (Cadangan)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Ranking</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Nama</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">NISN</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Jurusan</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Score</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitingListStudents.map((student: any, index: number) => (
                        <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <Badge variant="outline">#{index + 1}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{student.name}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{student.nisn}</td>
                          <td className="py-3 px-4 text-slate-600">{student.major?.name}</td>
                          <td className="py-3 px-4 text-slate-600">{student.averageScore?.toFixed(2) || '0.00'}</td>
                          <td className="py-3 px-4">
                            <Button size="sm" className="text-green-600 hover:text-green-700">
                              <UserPlus size={14} className="mr-1" />
                              Jadikan Eligible
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {waitingListStudents.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Users size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Tidak ada siswa di waiting list</p>
                    <p className="text-sm">Semua siswa eligible sudah terpilih atau belum ada data siswa</p>
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