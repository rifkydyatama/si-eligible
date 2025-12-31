"use server"

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginStudent(prevState: any, formData: FormData) {
  const nisn = (formData.get('nisn') as string || '').trim()
  const dob = formData.get('dob') as string

  if (!nisn || !dob) {
    return { error: 'NISN dan Tanggal Lahir diperlukan.' }
  }

  try {
    const student = await prisma.student.findUnique({ where: { nisn } })
    if (!student) return { error: 'Siswa tidak ditemukan.' }

    const birthDate = student.birthDate?.toISOString().slice(0,10)
    if (!birthDate || birthDate !== dob) return { error: 'Tanggal Lahir tidak cocok.' }

    const cookieStore = await cookies()
    cookieStore.set('student_session', student.id.toString(), { path: '/', httpOnly: true, maxAge: 60*60*24*7 })

    redirect('/student/dashboard')
  } catch (e) {
    console.error('loginStudent error', e)
    return { error: 'Terjadi kesalahan saat login.' }
  }
}
