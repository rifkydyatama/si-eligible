import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Users,
  Award,
  UserCheck,
  AlertCircle,
  Upload,
  Download,
  Activity,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Database,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { importDataSiswa, triggerRankingProcess } from './actions'

export default async function DashboardPage() {
  // 1. Check Session
  const cookieStore = await cookies()
  const adminId = cookieStore.get('admin_session')?.value
  if (!adminId) redirect('/admin/login')

  // 2. Data Fetching
  const admin = await prisma.user.findUnique({ where: { id: parseInt(adminId) } })
  const config = await prisma.appConfig.findFirst()

  const totalSiswa = await prisma.student.count()
  const siswaEligible = await prisma.student.count({ where: { isEligible: true } })
  const siswaVerified = await prisma.student.count({ where: { dataStatus: 'VERIFIED' } })
  const pendingRebuttals = await prisma.rebuttal.count({ where: { status: 'PENDING' } })

  const majors = await prisma.major.findMany({
    orderBy: { name: 'asc' }
  })

  const totalQuota = majors.reduce((sum: number, m: any) => sum + m.quotaCount, 0)
  const eligiblePercentage = totalSiswa > 0 ? Math.round((siswaEligible / totalSiswa) * 100) : 0

  // Get recent students for the table
  const recentStudents = await prisma.student.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      major: true
    }
  })

  // Get recent activities (mock data for now - in real app, you'd have an activity log table)
  const recentActivities = [
    {
      id: 1,
      action: 'Student data imported',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'import'
    },
    {
      id: 2,
      action: 'Ranking process completed',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      type: 'ranking'
    },
    {
      id: 3,
      action: 'New rebuttal submitted',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      type: 'rebuttal'
    },
    {
      id: 4,
      action: 'Quota settings updated',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      type: 'config'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {admin?.name}. Here's what's happening with your school system.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={totalSiswa}
            icon={<Users className="h-5 w-5 text-blue-600" />}
            trend={12}
            trendLabel="from last month"
          />
          <StatCard
            title="Eligible Students"
            value={siswaEligible}
            icon={<Award className="h-5 w-5 text-green-600" />}
            trend={eligiblePercentage}
            trendLabel={`of total students`}
            isPercentage={true}
          />
          <StatCard
            title="Verified Students"
            value={siswaVerified}
            icon={<UserCheck className="h-5 w-5 text-purple-600" />}
            trend={98}
            trendLabel="verification rate"
            isPercentage={true}
          />
          <StatCard
            title="Pending Rebuttals"
            value={pendingRebuttals}
            icon={<AlertCircle className="h-5 w-5 text-orange-600" />}
            trend={pendingRebuttals > 0 ? -pendingRebuttals : 0}
            trendLabel="requires attention"
            isNegative={pendingRebuttals > 0}
          />
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Import Area - Left Side (Wider) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Import Section */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 flex items-center gap-3">
                  <Upload className="h-5 w-5" />
                  Import Student Data
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Upload Excel files to bulk import student information and grades
                </p>
              </CardHeader>
              <CardContent>
                <form action={importDataSiswa} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        name="excelFile"
                        accept=".xlsx,.xls"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium rounded-lg shadow-sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>

                  {/* Format Requirements */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Required Excel Format</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">NISN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">NAMA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">JURUSAN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">NILAI_MTK</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">NILAI_INGGRIS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">NILAI_INDO</span>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 flex items-center gap-3">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Access frequently used administrative functions
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/admin/rebuttals">
                    <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 h-16 flex-col gap-2 transition-all duration-200 hover:shadow-sm">
                      <AlertCircle className="h-5 w-5" />
                      <div className="text-center">
                        <span className="font-medium text-sm">Review Rebuttals</span>
                        <span className="text-xs text-gray-500">{pendingRebuttals} pending</span>
                      </div>
                    </Button>
                  </Link>

                  <form action={triggerRankingProcess}>
                    <Button
                      type="submit"
                      className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 h-16 flex-col gap-2 transition-all duration-200 hover:shadow-sm"
                    >
                      <TrendingUp className="h-5 w-5" />
                      <div className="text-center">
                        <span className="font-medium text-sm">Run Ranking</span>
                        <span className="text-xs text-gray-500">Update calculations</span>
                      </div>
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Recent Students Table */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Recent Students</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Latest student records added to the system
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-gray-200">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Link href="/admin/students">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {recentStudents.length > 0 ? (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold text-gray-900">NISN</TableHead>
                          <TableHead className="font-semibold text-gray-900">Name</TableHead>
                          <TableHead className="font-semibold text-gray-900">Major</TableHead>
                          <TableHead className="font-semibold text-gray-900">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900">Eligible</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentStudents.map((student) => (
                          <TableRow key={student.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-gray-900">{student.nisn}</TableCell>
                            <TableCell className="text-gray-700">{student.name}</TableCell>
                            <TableCell className="text-gray-700">{student.major?.name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge
                                variant={student.dataStatus === 'VERIFIED' ? 'default' : 'secondary'}
                                className={
                                  student.dataStatus === 'VERIFIED'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                }
                              >
                                {student.dataStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={student.isEligible ? 'default' : 'destructive'}
                                className={
                                  student.isEligible
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-red-100 text-red-800 border-red-200'
                                }
                              >
                                {student.isEligible ? 'Eligible' : 'Not Eligible'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Database className="h-12 w-12 text-gray-400" />}
                    title="No students yet"
                    description="Get started by importing student data using the Excel import feature above, or manually add students."
                    action={
                      <Link href="/admin/upload-students">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Student
                        </Button>
                      </Link>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Log - Right Side (Narrower) */}
          <div className="space-y-6">
            {/* Activity Log */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 flex items-center gap-3">
                  <Activity className="h-5 w-5" />
                  Activity Log
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Recent system activities and changes
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'import' ? 'bg-blue-500' :
                        activity.type === 'ranking' ? 'bg-green-500' :
                        activity.type === 'rebuttal' ? 'bg-orange-500' : 'bg-purple-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {activity.timestamp.toLocaleString('id-ID', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  System Status
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Current system health and configuration
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-green-900">Database</p>
                        <p className="text-xs text-green-700">Connected & Healthy</p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Global Quota</p>
                        <p className="text-xs text-blue-700">{config?.quotaPercentage || 40}% of students</p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-purple-900">Ranking Engine</p>
                        <p className="text-xs text-purple-700">Active & Processing</p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Actions */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 flex items-center gap-3">
                  <Download className="h-5 w-5" />
                  Export Data
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Download system data for external use
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a
                    href="/api/admin/export/snmpb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 justify-start">
                      <FileSpreadsheet className="h-4 w-4 mr-3" />
                      Export SNPMB Data
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon, trend, trendLabel, isPercentage = false, isNegative = false }: {
  title: string
  value: number
  icon: React.ReactNode
  trend: number
  trendLabel: string
  isPercentage?: boolean
  isNegative?: boolean
}) {
  const trendValue = isPercentage ? `${trend}%` : trend > 0 ? `+${trend}` : trend
  const trendColor = isNegative ? 'text-red-600' : trend >= 0 ? 'text-green-600' : 'text-red-600'
  const TrendIcon = isNegative || trend < 0 ? TrendingDown : TrendingUp

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</p>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                {trendValue}
              </div>
              <span className="text-sm text-gray-500">{trendLabel}</span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Empty State Component
function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  )
}