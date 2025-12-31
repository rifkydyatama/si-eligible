import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { markDataConfirmed, submitRebuttal } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  User,
  Award,
  CheckCircle,
  FileText,
  AlertTriangle,
  Download,
  TrendingUp,
  BookOpen,
  LogOut
} from 'lucide-react'

async function getStudentFromCookie() {
  const cookieStore = await cookies()
  const sid = cookieStore.get('student_session')?.value
  if (!sid) return null
  const student = await prisma.student.findUnique({
    where: { id: Number(sid) },
    include: { major: true, logs: true }
  })
  return student
}

export default async function StudentDashboard() {
  const student = await getStudentFromCookie()
  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Akses Ditolak</h2>
            <p className="text-slate-600 mb-4">Silakan login terlebih dahulu untuk mengakses dashboard.</p>
            <Link href="/student/login">
              <Button className="w-full">Login Siswa</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate completeness
  const fields = ['name', 'nisn', 'averageScore']
  let filled = 0
  for (const f of fields) if ((student as any)[f]) filled++
  const completenessPercent = Math.round((filled / fields.length) * 100)

  // Get ranking info
  const ranking = student.ranking
    ? `Peringkat ${student.ranking} dari ${student.major?.totalStudents || 0} siswa`
    : 'Ranking belum dihitung'

  const isEligible = student.isEligible
  const isVerified = student.dataStatus === 'VERIFIED'
  const isFinal = student.dataStatus === 'FINAL'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-xl shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Portal Siswa</h1>
              <p className="text-sm text-slate-500">SMKN 1 Kademangan - Sistem Penjaringan SNBP</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-lg font-semibold text-slate-800">{student.name}</p>
              <p className="text-sm text-slate-500">{student.major?.name} | NISN: {student.nisn}</p>
            </div>
            <Button variant="outline" size="sm" className="text-slate-600 border-slate-300">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Selamat Datang, {student.name}!</h2>
              <p className="text-green-100 text-lg">Pantau progress dan status penjaringan SNBP Anda</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{student.averageScore}</div>
                <div className="text-sm text-green-100">Rata-rata Nilai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Data Status */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="text-blue-600" size={20} />
                Status Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Kelengkapan Data</span>
                  <span className="font-semibold text-blue-600">{completenessPercent}%</span>
                </div>
                <Progress value={completenessPercent} className="h-2" />
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm font-medium">
                    {isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ranking Status */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="text-purple-600" size={20} />
                Peringkat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-purple-600">
                  #{student.ranking || 'N/A'}
                </div>
                <p className="text-sm text-slate-600">{ranking}</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isEligible ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                  <span className="text-sm font-medium">
                    {isEligible ? 'Eligible SNBP' : 'Belum Eligible'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={20} />
                Aksi Cepat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/student/check">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Cek Nilai Lengkap
                  </Button>
                </Link>
                {isFinal && (
                  <a href="/api/student/verification-pdf" download>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Confirm Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-emerald-600" size={20} />
                Konfirmasi Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Pastikan data nilai Anda sudah benar sebelum mengunci. Setelah dikonfirmasi,
                data tidak dapat diubah lagi.
              </p>
              <form action={markDataConfirmed}>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isFinal}
                >
                  {isFinal ? 'Data Sudah Dikonfirmasi' : '✓ Konfirmasi Data'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Rebuttal Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-orange-600" size={20} />
                Ajukan Sanggahan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Jika menemukan kesalahan pada data nilai, ajukan sanggahan dengan melampirkan bukti.
              </p>
              <form action={submitRebuttal} encType="multipart/form-data" className="space-y-4">
                <textarea
                  name="note"
                  placeholder="Jelaskan kesalahan yang ditemukan..."
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Bukti (Foto Rapor/Dokumen)
                  </label>
                  <input
                    name="proof"
                    type="file"
                    accept="image/*"
                    className="w-full border border-slate-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                </div>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                  Kirim Sanggahan
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {student.logs && student.logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-slate-600" size={20} />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.logs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{log.action}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(log.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
