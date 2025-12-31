"use client"

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Users,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  School,
  LogOut,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  Settings,
  FileText,
  UserCheck,
  Upload,
  Loader2,
  Check,
  X,
  Plus,
  FileUp,
  Database,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { importDataSiswa, triggerRankingProcess } from './actions'

// Client component for interactive features
export default function DashboardClient({
  admin,
  config,
  totalSiswa,
  siswaEligible,
  siswaVerified,
  pendingRebuttals,
  majors,
  totalQuota,
  eligiblePercentage
}: any) {
  const [isPending, startTransition] = useTransition()
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleImport = (formData: FormData) => {
    startTransition(async () => {
      try {
        await importDataSiswa(formData)
        showNotification('success', 'Data siswa berhasil diimpor!')
      } catch (error) {
        showNotification('error', 'Gagal mengimpor data siswa. Silakan coba lagi.')
      }
    })
  }

  const handleRanking = () => {
    startTransition(async () => {
      try {
        await triggerRankingProcess(new FormData())
        showNotification('success', 'Proses ranking berhasil dijalankan!')
      } catch (error) {
        showNotification('error', 'Gagal menjalankan proses ranking.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2">
          <Alert className={`w-96 shadow-lg border-l-4 ${notification.type === 'success' ? 'border-l-green-500 bg-green-50 border-green-200' : 'border-l-red-500 bg-red-50 border-red-200'}`}>
            <AlertDescription className={`flex items-center gap-3 ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {notification.type === 'success' ? <Check size={20} className="text-green-600" /> : <X size={20} className="text-red-600" />}
              <span className="font-medium">{notification.message}</span>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Modern Sidebar Navigation */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-white shadow-xl border-r border-slate-200/60 min-h-screen">
          {/* Logo & Brand */}
          <div className="p-8 border-b border-slate-200/60">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg">
                <School size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Si-Eligible</h1>
                <p className="text-sm text-slate-500 font-medium">SMKN 1 Kademangan</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-6 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">Dashboard</div>

            <Link href="/admin/dashboard" className="flex items-center gap-4 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200/50 transition-all duration-200 hover:shadow-md hover:bg-blue-100">
              <BarChart3 size={22} />
              <span className="font-semibold">Overview</span>
            </Link>

            <div className="pt-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">Data Management</div>

              <Link href="/admin/students" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-sm">
                <Users size={22} />
                <span className="font-medium">Manajemen Siswa</span>
              </Link>

              <Link href="/admin/upload-students" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-sm">
                <UserCheck size={22} />
                <span className="font-medium">Upload Siswa</span>
              </Link>

              <Link href="/admin/upload-grades" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-sm">
                <FileSpreadsheet size={22} />
                <span className="font-medium">Upload Nilai</span>
              </Link>

              <Link href="/admin/upload-majors" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-sm">
                <School size={22} />
                <span className="font-medium">Upload Jurusan</span>
              </Link>

              <Link href="/admin/eligible-management" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-sm">
                <Award size={22} />
                <span className="font-medium">Kelola Eligible</span>
              </Link>
            </div>

            <div className="pt-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">Approval & Quota</div>

              <Link href="/admin/rebuttals" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-sm">
                <AlertCircle size={22} />
                <span className="font-medium">Approval Sanggahan</span>
                {pendingRebuttals > 0 && (
                  <Badge variant="destructive" className="ml-auto animate-pulse bg-red-500 text-white">
                    {pendingRebuttals}
                  </Badge>
                )}
              </Link>

              <Link href="/admin/quotas" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-sm">
                <Target size={22} />
                <span className="font-medium">Manajemen Kuota</span>
              </Link>
            </div>

            <div className="pt-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">Tools</div>

              <a href="/api/admin/export/snmpb" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-sm">
                <Download size={22} />
                <span className="font-medium">Export SNPMB</span>
              </a>

              <Link href="/admin/import" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-sm">
                <FileText size={22} />
                <span className="font-medium">Import Data</span>
              </Link>
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="absolute bottom-0 w-72 p-6 border-t border-slate-200/60 bg-slate-50/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {admin?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 font-semibold truncate">{admin?.name}</p>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">
                  {admin?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full text-slate-600 border-slate-300 hover:bg-slate-100 rounded-xl font-medium">
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Main Dashboard Area */}
          <div className="flex-1 p-8 space-y-8">
            {/* Top Header */}
            <header className="bg-white border border-slate-200 rounded-2xl px-8 py-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
                  <p className="text-slate-500 mt-2 font-medium">Pantau performa sistem penjaringan SNBP SMKN 1 Kademangan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-medium">Terakhir diperbarui</p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date().toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Siswa"
                value={totalSiswa}
                icon={<Users className="text-blue-600" />}
                bgColor="bg-blue-50"
                trend="+12%"
                trendLabel="dari bulan lalu"
                trendUp={true}
              />
              <MetricCard
                title="Siswa Eligible"
                value={siswaEligible}
                icon={<Award className="text-emerald-600" />}
                bgColor="bg-emerald-50"
                trend={`${eligiblePercentage}%`}
                trendLabel="dari total siswa"
                trendUp={true}
              />
              <MetricCard
                title="Terverifikasi"
                value={siswaVerified}
                icon={<UserCheck className="text-purple-600" />}
                bgColor="bg-purple-50"
                trend="98%"
                trendLabel="tingkat verifikasi"
                trendUp={true}
              />
              <MetricCard
                title="Sanggahan Pending"
                value={pendingRebuttals}
                icon={<AlertCircle className="text-orange-600" />}
                bgColor="bg-orange-50"
                trend={pendingRebuttals > 0 ? "Perlu Perhatian" : "Clear"}
                trendLabel="menunggu approval"
                trendUp={false}
              />
            </div>

            {/* Prominent Import Excel Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3 text-2xl">
                  <Upload size={28} />
                  Import Data Siswa Excel
                </CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Upload file Excel untuk mengimpor data siswa secara massal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleImport} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <input
                        type="file"
                        name="excelFile"
                        accept=".xlsx,.xls"
                        required
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-blue-600 hover:file:bg-blue-50"
                        placeholder="Pilih file Excel..."
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={20} className="mr-3 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload size={20} className="mr-3" />
                          Import Data
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-sm text-blue-200 font-medium mb-2">Format Excel yang diperlukan:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>NISN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>NAMA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>JURUSAN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>NILAI_MTK</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>NILAI_INGGRIS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>NILAI_INDO</span>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-slate-900 text-xl">
                  <Activity size={24} />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Akses cepat ke fitur-fitur utama sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/admin/rebuttals">
                    <Button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 h-20 flex-col gap-3 transition-all duration-200 hover:shadow-md rounded-xl">
                      <AlertCircle size={24} />
                      <div className="text-center">
                        <span className="font-semibold text-sm">Approval Sanggahan</span>
                        <span className="text-xs text-slate-500 block">{pendingRebuttals} pending</span>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/admin/quotas">
                    <Button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 h-20 flex-col gap-3 transition-all duration-200 hover:shadow-md rounded-xl">
                      <Target size={24} />
                      <div className="text-center">
                        <span className="font-semibold text-sm">Manage Kuota</span>
                        <span className="text-xs text-slate-500 block">{totalQuota} total kuota</span>
                      </div>
                    </Button>
                  </Link>

                  <Button
                    onClick={handleRanking}
                    disabled={isPending}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 h-20 flex-col gap-3 transition-all duration-200 hover:shadow-md rounded-xl"
                  >
                    {isPending ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <RefreshCw size={24} />
                    )}
                    <div className="text-center">
                      <span className="font-semibold text-sm">Run Ranking</span>
                      <span className="text-xs text-slate-500 block">Update calculations</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Students Table */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 text-xl">Recent Students</CardTitle>
                    <CardDescription className="text-slate-500">
                      Siswa yang baru saja ditambahkan ke sistem
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-xl border-slate-200">
                    <Search size={16} className="mr-2" />
                    Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {totalSiswa > 0 ? (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                          <TableHead className="font-semibold text-slate-900">NISN</TableHead>
                          <TableHead className="font-semibold text-slate-900">Nama</TableHead>
                          <TableHead className="font-semibold text-slate-900">Jurusan</TableHead>
                          <TableHead className="font-semibold text-slate-900">Nilai Rata-rata</TableHead>
                          <TableHead className="font-semibold text-slate-900">Status</TableHead>
                          <TableHead className="font-semibold text-slate-900">Eligible</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Mock data - in real app, fetch recent students */}
                        <TableRow className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-slate-900">1234567890</TableCell>
                          <TableCell className="text-slate-700">Ahmad Rahman</TableCell>
                          <TableCell className="text-slate-700">Teknik Komputer</TableCell>
                          <TableCell className="font-semibold text-slate-900">87.5</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                              Verified
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500 text-white">
                              Eligible
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-slate-900">1234567891</TableCell>
                          <TableCell className="text-slate-700">Siti Nurhaliza</TableCell>
                          <TableCell className="text-slate-700">Akuntansi</TableCell>
                          <TableCell className="font-semibold text-slate-900">82.3</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                              Verified
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="bg-red-500 text-white">
                              Not Eligible
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-slate-900">1234567892</TableCell>
                          <TableCell className="text-slate-700">Budi Santoso</TableCell>
                          <TableCell className="text-slate-700">Teknik Mesin</TableCell>
                          <TableCell className="font-semibold text-slate-900">91.2</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500 text-white">
                              Eligible
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Database size={48} />}
                    title="No students yet"
                    description="Start by importing student data using the Excel import feature above."
                    action={
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                        <Plus size={16} className="mr-2" />
                        Import Students
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>

            {/* Kuota Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-slate-900 text-xl">
                    <TrendingUp className="text-blue-600" size={24} />
                    Distribusi Kuota per Jurusan
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Overview kuota dan pemanfaatan untuk setiap jurusan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {majors.slice(0, 5).map((major: any, index: number) => (
                      <div key={major.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors duration-200 border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'][index % 5]}`}></div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{major.name}</p>
                            <p className="text-sm text-slate-500">{major.totalStudents} siswa total</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-xl">{major.quotaCount}</p>
                          <p className="text-xs text-slate-500 font-medium">kuota</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-slate-900 text-xl">
                    <Settings className="text-emerald-600" size={24} />
                    System Status
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Status konfigurasi dan performa sistem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                        <div>
                          <p className="font-semibold text-emerald-900">Database Status</p>
                          <p className="text-sm text-emerald-600">Connected & Healthy</p>
                        </div>
                      </div>
                      <CheckCircle2 size={20} className="text-emerald-600" />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-semibold text-blue-900">Kuota Global</p>
                          <p className="text-sm text-blue-600">{config?.quotaPercentage || 40}% dari total siswa</p>
                        </div>
                      </div>
                      <CheckCircle2 size={20} className="text-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-purple-50/50 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="font-semibold text-purple-900">Ranking Engine</p>
                          <p className="text-sm text-purple-600">Active & Processing</p>
                        </div>
                      </div>
                      <CheckCircle2 size={20} className="text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sticky Right Sidebar - Activity Log */}
          <div className="w-80 bg-white border-l border-slate-200 shadow-xl sticky top-0 h-screen overflow-y-auto">
            <div className="p-8 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <Activity size={24} />
                Activity Log
              </h2>
              <p className="text-slate-500 mt-2 font-medium">Recent system activities</p>
            </div>
            <div className="p-8 space-y-6">
              {/* Mock activity items - in real app, fetch from database */}
              <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Data siswa diimpor</p>
                  <p className="text-xs text-slate-500 font-medium">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Ranking process completed</p>
                  <p className="text-xs text-slate-500 font-medium">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">New rebuttal submitted</p>
                  <p className="text-xs text-slate-500 font-medium">6 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Quota updated</p>
                  <p className="text-xs text-slate-500 font-medium">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modern Metric Card Component
function MetricCard({ title, value, icon, bgColor, trend, trendLabel, trendUp }: any) {
  return (
    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 rounded-2xl overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">{title}</p>
            <h3 className="text-5xl font-bold text-slate-900 mb-3">{value.toLocaleString()}</h3>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                trendUp
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}>
                {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
              </div>
              <span className="text-xs text-slate-500 font-medium">{trendLabel}</span>
            </div>
          </div>
          <div className={`p-4 rounded-2xl ${bgColor} shadow-sm`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Empty State Component
function EmptyState({ icon, title, description, action }: any) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  )
}