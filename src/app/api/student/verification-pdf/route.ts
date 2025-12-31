import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import jsPDF from 'jspdf'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const sid = cookieStore.get('student_session')?.value
  if (!sid) return new NextResponse('Unauthorized', { status: 401 })

  const student = await prisma.student.findUnique({ where: { id: Number(sid) }, include: { major: true } })
  if (!student || student.dataStatus !== 'FINAL') {
    return new NextResponse('Data belum final', { status: 403 })
  }

  // Generate simple PDF
  const doc = new jsPDF()
  doc.text('Bukti Verifikasi Nilai SNBP', 20, 20)
  doc.text(`Nama: ${student.name}`, 20, 40)
  doc.text(`NISN: ${student.nisn}`, 20, 50)
  doc.text(`Jurusan: ${student.major?.name || ''}`, 20, 60)
  doc.text(`Rata-rata: ${student.averageScore}`, 20, 70)
  doc.text(`Status: ${student.dataStatus}`, 20, 80)
  doc.text(`Tanggal: ${new Date().toLocaleDateString()}`, 20, 90)

  const pdfBuffer = doc.output('arraybuffer')

  return new NextResponse(Buffer.from(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=bukti-verifikasi.pdf'
    }
  })
}