import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { addExportJobFile } from '@/lib/fileQueue'

export async function GET() {
  const cookieStore = await cookies()
  const adminId = cookieStore.get('admin_session')?.value
  if (!adminId) return new NextResponse('Unauthorized', { status: 401 })

  // Check admin role
  const admin = await prisma.user.findUnique({ where: { id: Number(adminId) } })
  if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN_BK')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Create an ExportJob record (processing)
  const job = await prisma.exportJob.create({
    data: {
      type: 'SNMPB',
      status: 'PROCESSING',
      params: {},
    }
  })

  // Enqueue export job for worker
  try {
    await addExportJobFile({ type: 'SNMPB', jobId: job.id })
    return NextResponse.redirect('/admin/exports')
  } catch (err) {
    console.error('Queue add failed:', err)
    await prisma.exportJob.update({ where: { id: job.id }, data: { status: 'FAILED' } })
    return new NextResponse('Failed to enqueue export', { status: 500 })
  }
}
