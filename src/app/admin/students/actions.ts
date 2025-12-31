'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const addStudentSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  nisn: z.string().min(10, 'NISN minimal 10 karakter').max(10, 'NISN maksimal 10 karakter'),
  majorId: z.string().min(1, 'Jurusan wajib dipilih'),
  grade: z.number().min(0, 'Nilai minimal 0').max(100, 'Nilai maksimal 100'),
  ranking: z.number().min(1, 'Ranking minimal 1'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
})

export async function addStudent(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      nisn: formData.get('nisn') as string,
      majorId: formData.get('majorId') as string,
      grade: parseFloat(formData.get('grade') as string),
      ranking: parseInt(formData.get('ranking') as string),
      birthDate: formData.get('birthDate') as string,
    }

    // Validate data
    const validatedData = addStudentSchema.parse(data)

    // Check if NISN already exists
    const existingStudent = await prisma.student.findUnique({
      where: { nisn: validatedData.nisn }
    })

    if (existingStudent) {
      throw new Error('NISN sudah terdaftar')
    }

    // Create student
    await prisma.student.create({
      data: {
        name: validatedData.name,
        nisn: validatedData.nisn,
        majorId: parseInt(validatedData.majorId),
        averageScore: validatedData.grade, // Use averageScore instead of grade
        ranking: validatedData.ranking,
        birthDate: new Date(validatedData.birthDate), // Convert string to Date
        dataStatus: 'VERIFIED', // Manual entry is automatically verified
        isEligible: false, // Will be calculated by the system
      }
    })

    revalidatePath('/admin/students')
    return { success: true, message: 'Siswa berhasil ditambahkan' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    }
    return { success: false, message: error instanceof Error ? error.message : 'Terjadi kesalahan' }
  }
}