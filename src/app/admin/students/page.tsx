import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/toast'
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  School,
  BarChart3,
  Target,
  Download,
  FileText,
  UserCheck,
  Award,
  LogOut,
  Plus,
  Upload,
  FileSpreadsheet,
  Activity,
  Clock,
  UserPlus,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { AddStudentModal } from './AddStudentModal'
import { Suspense } from 'react'

export default async function StudentsPage() {
  // 1. Check Session
  const cookieStore = await cookies()
  const adminId = cookieStore.get('admin_session')?.value
  if (!adminId) redirect('/admin/login')

  // 2. Data Fetching
  const admin = await prisma.user.findUnique({ where: { id: parseInt(adminId) } })

  const students = await prisma.student.findMany({
    include: {
      major: true,
      rebuttals: {
        where: { status: 'PENDING' },
        select: { id: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  const majors = await prisma.major.findMany({
    orderBy: { name: 'asc' }
  })

  const totalStudents = students.length
  const eligibleStudents = students.filter((s: any) => s.isEligible).length
  const verifiedStudents = students.filter((s: any) => s.dataStatus === 'VERIFIED').length
  const pendingRebuttals = students.reduce((sum: number, s: any) => sum + s.rebuttals.length, 0)

  // Mock activity log data
  const activityLog = [
    { id: 1, action: 'Student Added', details: 'Ahmad Fauzi added manually', time: '2 minutes ago', type: 'success' },
    { id: 2, action: 'Data Exported', details: 'SNPMB export completed', time: '15 minutes ago', type: 'info' },
    { id: 3, action: 'Eligibility Updated', details: '3 students marked as eligible', time: '1 hour ago', type: 'success' },
    { id: 4, action: 'Rebuttal Approved', details: 'Sanggahan Rizki Pratama approved', time: '2 hours ago', type: 'warning' },
    { id: 5, action: 'Bulk Import', details: '45 students imported from Excel', time: '1 day ago', type: 'info' },
  ]

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg border-r border-slate-200 min-h-screen">
            {/* Logo & Brand */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
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

                <Link href="/admin/students" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-md">
                  <Users size={20} />
                  <span className="font-medium">Manajemen Siswa</span>
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
                  {pendingRebuttals > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      {pendingRebuttals}
                    </span>
                  )}
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
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
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
          <div className="flex-1 flex">
            {/* Main Content Area */}
            <div className="flex-1 p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">Student Management</h1>
                    <p className="text-slate-600 text-lg">Manage and monitor student data for SMKN 1 Kademangan</p>
                  </div>
                  <div className="flex gap-3">
                    <AddStudentModal majors={majors} />
                    <Button variant="outline" className="flex items-center gap-2 hover:bg-slate-50 transition-all duration-200 hover:shadow-md">
                      <Filter size={16} />
                      Filter
                    </Button>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-105">
                      <Download size={16} />
                      Export Data
                    </Button>
                  </div>
                </div>

                {/* Key Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">Total Students</p>
                          <p className="text-4xl font-bold text-slate-800">{totalStudents.toLocaleString()}</p>
                          <p className="text-xs text-slate-400 mt-1">Active records</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Users size={24} className="text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">Eligible Students</p>
                          <p className="text-4xl font-bold text-slate-800">{eligibleStudents.toLocaleString()}</p>
                          <p className="text-xs text-green-600 mt-1">+{Math.round((eligibleStudents/totalStudents)*100)}% of total</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <CheckCircle2 size={24} className="text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">Verified Data</p>
                          <p className="text-4xl font-bold text-slate-800">{verifiedStudents.toLocaleString()}</p>
                          <p className="text-xs text-purple-600 mt-1">{Math.round((verifiedStudents/totalStudents)*100)}% verified</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <UserCheck size={24} className="text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">Pending Appeals</p>
                          <p className="text-4xl font-bold text-slate-800">{pendingRebuttals.toLocaleString()}</p>
                          <p className="text-xs text-orange-600 mt-1">Requires attention</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <AlertCircle size={24} className="text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Prominent Import Excel Section */}
              <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <FileSpreadsheet size={24} className="text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-800">Bulk Import Students</CardTitle>
                      <CardDescription className="text-slate-600">
                        Upload student data from Excel files for efficient batch processing
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-105">
                      <Upload size={16} className="mr-2" />
                      Choose Excel File
                    </Button>
                    <div className="text-sm text-slate-500">
                      Supports .xlsx and .xls formats • Maximum 10MB • Template available
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search and Filters */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <Input
                          placeholder="Search students by name, NISN, or major..."
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-11 hover:bg-slate-50 transition-all duration-200">
                          <Filter size={16} className="mr-2" />
                          Filters
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>All Students</DropdownMenuItem>
                        <DropdownMenuItem>Eligible Only</DropdownMenuItem>
                        <DropdownMenuItem>Not Eligible</DropdownMenuItem>
                        <DropdownMenuItem>Unverified</DropdownMenuItem>
                        <DropdownMenuItem>With Pending Appeals</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>

              {/* Students Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-slate-800">Student Records</CardTitle>
                      <CardDescription>
                        Complete list of all registered students with their eligibility status
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {totalStudents} total records
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold text-slate-700">Student Name</TableHead>
                          <TableHead className="font-semibold text-slate-700">NISN</TableHead>
                          <TableHead className="font-semibold text-slate-700">Major</TableHead>
                          <TableHead className="font-semibold text-slate-700">Average Score</TableHead>
                          <TableHead className="font-semibold text-slate-700">Status</TableHead>
                          <TableHead className="font-semibold text-slate-700">Eligibility</TableHead>
                          <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student: any) => (
                          <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium text-slate-900">
                              {student.name}
                            </TableCell>
                            <TableCell className="text-slate-600 font-mono">
                              {student.nisn}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {student.major?.name || '-'}
                            </TableCell>
                            <TableCell className="text-slate-600 font-medium">
                              {student.averageScore?.toFixed(2) || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.dataStatus === 'VERIFIED' ? 'default' : 'secondary'}>
                                {student.dataStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {student.isEligible ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors">
                                  <CheckCircle2 size={12} className="mr-1" />
                                  Eligible
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-500 hover:bg-slate-100 transition-colors">
                                  <XCircle size={12} className="mr-1" />
                                  Not Eligible
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 transition-colors">
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="cursor-pointer">
                                    <Eye size={14} className="mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer">
                                    <Edit size={14} className="mr-2" />
                                    Edit Student
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer text-red-600 hover:text-red-700">
                                    <Trash2 size={14} className="mr-2" />
                                    Delete Student
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sticky Activity Log Sidebar */}
            <div className="w-80 bg-white border-l border-slate-200 p-6 sticky top-0 h-screen overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" />
                  Activity Log
                </h3>
                <p className="text-sm text-slate-500">Recent system activities and updates</p>
              </div>

              <div className="space-y-4">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-100' :
                      activity.type === 'warning' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      {activity.type === 'success' ? (
                        <CheckCircle2 size={14} className="text-green-600" />
                      ) : activity.type === 'warning' ? (
                        <AlertCircle size={14} className="text-orange-600" />
                      ) : (
                        <Activity size={14} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                      <p className="text-xs text-slate-500 mb-1">{activity.details}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button variant="outline" className="w-full hover:bg-slate-50 transition-all duration-200">
                  View All Activities
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastViewport />
    </ToastProvider>
  )
}