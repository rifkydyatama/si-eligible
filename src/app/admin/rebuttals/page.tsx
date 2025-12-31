import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { approveRebuttal, rejectRebuttal } from './actions'

async function getRebuttals() {
  const cookieStore = await cookies()
  const aid = cookieStore.get('admin_session')?.value
  if (!aid) return []
  const admin = await prisma.user.findUnique({ where: { id: Number(aid) } })
  if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN_BK')) return []

  return await prisma.rebuttal.findMany({
    where: { status: 'PENDING' },
    include: { student: { include: { major: true } } }
  })
}

export default async function RebuttalsPage() {
  const rebuttals = await getRebuttals()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Approval Sanggahan</h1>
            <Link href="/admin/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              ← Kembali ke Dashboard
            </Link>
          </div>

          <div className="space-y-8">
            {rebuttals.map((r: any) => (
              <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{r.student.name}</h2>
                    <p className="text-gray-600">NISN: {r.student.nisn} | Jurusan: {r.student.major?.name}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Dibuat: {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-4 rounded border">
                    <h3 className="font-medium text-gray-700 mb-2">Deskripsi Sanggahan</h3>
                    <p className="text-gray-800">{r.description}</p>
                  </div>

                  {r.proofUrl && (
                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium text-gray-700 mb-2">Bukti Upload</h3>
                      <img src={r.proofUrl} alt="Bukti Sanggahan" className="max-w-full h-auto border rounded" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <form action={approveRebuttal} className="flex-1">
                    <input type="hidden" name="rebuttalId" value={r.id} />
                    <button className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                      ✓ Terima Revisi
                    </button>
                  </form>

                  <form action={rejectRebuttal} className="flex-1 space-y-3">
                    <textarea name="reason" placeholder="Alasan penolakan..." className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent" rows={3} />
                    <button type="submit" className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
                      ✗ Tolak
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {rebuttals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Tidak ada sanggahan pending saat ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}