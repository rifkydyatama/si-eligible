"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function approveRebuttal(formData: FormData): Promise<void> {
  const rebuttalId = Number(formData.get('rebuttalId'))
  const rebuttal = await prisma.rebuttal.findUnique({ where: { id: rebuttalId }, include: { student: true } })
  if (!rebuttal) return

  // For simplicity, assume approval updates student data (but in real, might need to parse claimed scores)
  await prisma.rebuttal.update({ where: { id: rebuttalId }, data: { status: 'APPROVED' } })
  await prisma.auditLog.create({ data: { action: 'APPROVE_REBUTTAL', details: `Approved rebuttal for ${rebuttal.student.name}`, createdAt: new Date() } })
  revalidatePath('/admin/rebuttals')
}

export async function rejectRebuttal(formData: FormData): Promise<void> {
  const rebuttalId = Number(formData.get('rebuttalId'))
  const reason = formData.get('reason') as string
  const rebuttal = await prisma.rebuttal.findUnique({ where: { id: rebuttalId }, include: { student: true } })
  if (!rebuttal) return

  await prisma.rebuttal.update({ where: { id: rebuttalId }, data: { status: 'REJECTED', adminNote: reason } })
  await prisma.auditLog.create({ data: { action: 'REJECT_REBUTTAL', details: `Rejected rebuttal for ${rebuttal.student.name}: ${reason}`, createdAt: new Date() } })
  revalidatePath('/admin/rebuttals')
}