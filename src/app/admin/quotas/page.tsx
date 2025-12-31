import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { updateQuotas } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

async function getMajors() {
  const cookieStore = await cookies()
  const aid = cookieStore.get('admin_session')?.value
  if (!aid) return []
  const admin = await prisma.user.findUnique({ where: { id: Number(aid) } })
  if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN_BK')) return []

  return await prisma.major.findMany({ orderBy: { name: 'asc' } })
}

export default async function QuotasPage() {
  const majors = await getMajors()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Manajemen Kuota</h1>
              <p className="text-sm text-gray-600">Kelola persentase kuota untuk setiap jurusan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Kuota Jurusan</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateQuotas} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {majors.map((m: any) => (
                    <div key={m.id} className="space-y-2">
                      <Label htmlFor={`quota_${m.id}`}>{m.name}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`quota_${m.id}`}
                          type="number"
                          name={`quota_${m.id}`}
                          defaultValue={m.quotaPercentage}
                          min="0"
                          max="100"
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit">Update Kuota</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}