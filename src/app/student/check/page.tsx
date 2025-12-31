import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Calculator, Award } from 'lucide-react'

async function getStudentData() {
  const cookieStore = await cookies()
  const sid = cookieStore.get('student_session')?.value
  if (!sid) return null
  const student = await prisma.student.findUnique({
    where: { id: Number(sid) },
    include: { grades: { include: { subject: true } }, major: true }
  })
  return student
}

export default async function CheckGradesPage() {
  const student = await getStudentData()
  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Akses Ditolak</h2>
            <p className="text-slate-600 mb-4">Silakan login terlebih dahulu untuk melihat nilai rapor.</p>
            <Link href="/student/login">
              <Button className="w-full">Login Siswa</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Group grades by semester
  const gradesBySemester = student.grades.reduce((acc: any, grade: any) => {
    if (!acc[grade.semester]) acc[grade.semester] = []
    acc[grade.semester].push(grade)
    return acc
  }, {} as Record<number, typeof student.grades>)

  // Calculate semester averages
  const semesterAverages = Object.keys(gradesBySemester).reduce((acc, sem) => {
    const grades = gradesBySemester[Number(sem)]
    const avg = grades.reduce((sum: number, g: any) => sum + g.score, 0) / grades.length
    acc[Number(sem)] = Math.round(avg * 100) / 100
    return acc
  }, {} as Record<number, number>)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/student/dashboard" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Nilai Rapor Lengkap</h1>
            <p className="text-sm text-slate-500">Periksa dan cocokkan nilai Semester 1-5 Anda</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Student Info Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-blue-100">{student.major?.name} | NISN: {student.nisn}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{student.averageScore}</div>
                <div className="text-sm text-blue-100">Rata-rata Keseluruhan</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Semester Grades */}
        {Object.keys(gradesBySemester).sort((a, b) => Number(a) - Number(b)).map(sem => {
          const semNum = Number(sem)
          const semesterAvg = semesterAverages[semNum]

          return (
            <Card key={semNum} className="shadow-lg">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-blue-600" size={24} />
                    <span>Semester {semNum}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-800">{semesterAvg}</div>
                      <div className="text-xs text-slate-500">Rata-rata Semester</div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {gradesBySemester[semNum].length} Mata Pelajaran
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {gradesBySemester[semNum].map((grade: any) => (
                    <div key={grade.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight">{grade.subject.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          grade.subject.isVocational
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {grade.subject.isVocational ? 'Peminatan' : 'Wajib'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calculator className="text-slate-400" size={16} />
                        <span className="text-2xl font-bold text-slate-800">{grade.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Summary & Actions */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Ringkasan Akademik</h3>
                <p className="text-sm text-slate-600">
                  Total {student.grades.length} nilai dari {Object.keys(gradesBySemester).length} semester
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/student/dashboard">
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Dashboard
                  </Button>
                </Link>
                {student.dataStatus === 'FINAL' && (
                  <a href="/api/student/verification-pdf" download>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Award className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}