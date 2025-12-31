"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateQuotas(formData: FormData): Promise<void> {
  const updates = []
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('quota_')) {
      const majorId = Number(key.split('_')[1])
      const quota = Number(value)
      updates.push(prisma.major.update({ where: { id: majorId }, data: { quotaPercentage: quota } }))
    }
  }
  await Promise.all(updates)
  revalidatePath('/admin/quotas')
}