"use server"

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// singleton Prisma client imported above

export async function loginAdmin(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Validasi Input Kosong
  if (!email || !password) {
    return { error: 'Email dan Password wajib diisi.' }
  }

  try {
    // 2. Cari Admin di Database
    const user = await prisma.user.findUnique({
      where: { email: email }
    })

    // 3. Cek apakah user ada & password cocok
    // (Note: Di production nanti kita encrypt password, sekarang plain dulu sesuai seeding)
    if (!user || user.password !== password) {
      return { error: 'Email atau Password salah.' }
    }

    // 4. Cek Role (hanya Admin/BK atau Super Admin yang boleh)
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN_BK') {
      return { error: 'Akses ditolak. Ini area Admin.' }
    }

    // 5. Bikin "Tiket Masuk" (Cookie)
    const cookieStore = await cookies()
    cookieStore.set('admin_session', user.id.toString(), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 // 1 Hari
    })

  } catch (err) {
    console.error("Login Error:", err)
    return { error: 'Terjadi kesalahan sistem.' }
  }

  // 6. Sukses? Lempar ke Dashboard
  redirect('/admin/dashboard')
}