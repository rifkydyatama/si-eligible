"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

export async function markDataConfirmed(formData: FormData): Promise<void> {
  const cookieStore = await cookies()
  const sid = cookieStore.get('student_session')?.value
  if (!sid) return

  const studentId = Number(sid)
  const config = await prisma.appConfig.findFirst()
  if (config?.verificationDeadline && new Date() > config.verificationDeadline) {
    console.error('Deadline passed')
    return
  }

  try {
    await prisma.student.update({ where: { id: studentId }, data: { dataStatus: 'FINAL' } })
    await prisma.auditLog.create({ data: { action: 'STUDENT_CONFIRM', details: `Student ${studentId} confirmed data`, createdAt: new Date(), adminId: null } })
    revalidatePath('/student/dashboard')
    return
  } catch (e) {
    console.error('markDataConfirmed', e)
    return
  }
}

export async function submitRebuttal(formData: FormData): Promise<void> {
  const cookieStore = await cookies()
  const sid = cookieStore.get('student_session')?.value
  if (!sid) return
  const studentId = Number(sid)

  const note = formData.get('note') as string || ''
  const file = formData.get('proof') as File | null

  let proofUrl: string | null = null
  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploads = path.join(process.cwd(), 'public', 'uploads')
    fs.mkdirSync(uploads, { recursive: true })
    const filename = `rebuttal-${studentId}-${Date.now()}.${(file.name || 'jpg').split('.').pop()}`
    const filePath = path.join(uploads, filename)
    fs.writeFileSync(filePath, buffer)
    proofUrl = `/uploads/${filename}`
  }

  try {
    await prisma.rebuttal.create({ data: { description: note, proofUrl: proofUrl || '', studentId, createdAt: new Date(), updatedAt: new Date() } })
    await prisma.auditLog.create({ data: { action: 'SUBMIT_REBUTTAL', details: `Student ${studentId} submitted rebuttal`, createdAt: new Date(), adminId: null } })
    revalidatePath('/student/dashboard')
    return
  } catch (e) {
    console.error('submitRebuttal', e)
    return
  }
}
