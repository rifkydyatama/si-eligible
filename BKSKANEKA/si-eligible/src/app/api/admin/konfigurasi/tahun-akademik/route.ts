// src/app/api/admin/konfigurasi/tahun-akademik/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua tahun akademik
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tahunAkademik = await prisma.tahunAkademik.findMany({
      orderBy: {
        tahun: 'desc'
      },
      include: {
        _count: {
          select: {
            periodeJalur: true,
            konfigurasiNilai: true,
            konfigurasiKuota: true
          }
        }
      }
    });

    return NextResponse.json(tahunAkademik);
  } catch (error) {
    console.error('Error fetching tahun akademik:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Tambah tahun akademik baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Raw request body:', body);
    const { tahun, tanggalMulai, tanggalSelesai, isActive } = body;

    // Debug logging
    console.log('Received data:', { tahun, tanggalMulai, tanggalSelesai, isActive });
    console.log('Session user:', session.user);
    console.log('Session:', session);

    // Validasi
    if (!tahun || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({
        error: 'Data tidak lengkap',
        received: { tahun, tanggalMulai, tanggalSelesai, isActive }
      }, { status: 400 });
    }

    // Validate dates
    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({
        error: 'Format tanggal tidak valid',
        received: { tanggalMulai, tanggalSelesai }
      }, { status: 400 });
    }

    if (startDate >= endDate) {
      return NextResponse.json({
        error: 'Tanggal mulai harus sebelum tanggal selesai'
      }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.tahunAkademik.findUnique({
      where: { tahun }
    });

    if (existing) {
      console.log('Duplicate tahun found:', existing);
      return NextResponse.json({
        error: 'Tahun akademik sudah ada. Silakan update data yang sudah ada atau gunakan tahun yang berbeda.',
        existing: {
          id: existing.id,
          tahun: existing.tahun,
          tanggalMulai: existing.tanggalMulai.toISOString().split('T')[0],
          tanggalSelesai: existing.tanggalSelesai.toISOString().split('T')[0],
          isActive: existing.isActive
        },
        suggestion: 'Gunakan endpoint PUT untuk mengupdate data yang sudah ada'
      }, { status: 409 }); // 409 Conflict is more appropriate than 400
    }

    // Jika isActive = true, nonaktifkan tahun akademik lain
    if (isActive) {
      await prisma.tahunAkademik.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const tahunAkademik = await prisma.tahunAkademik.create({
      data: {
        tahun,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        isActive: isActive || false
      }
    });

    // Log audit
    try {
      if (session.user.userId) {
        await prisma.auditLog.create({
          data: {
            userId: session.user.userId,
            userType: session.user.role,
            action: 'create_tahun_akademik',
            description: `Menambahkan tahun akademik: ${tahun}`
          }
        });
      } else {
        console.warn('Cannot create audit log: userId not found in session');
      }
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json(tahunAkademik, { status: 201 });
  } catch (error) {
    console.error('Error creating tahun akademik:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT: Update tahun akademik yang sudah ada
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, tahun, tanggalMulai, tanggalSelesai, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID tahun akademik diperlukan untuk update' }, { status: 400 });
    }

    // Check if record exists
    const existing = await prisma.tahunAkademik.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tahun akademik tidak ditemukan' }, { status: 404 });
    }

    // Validate dates if provided
    if (tanggalMulai || tanggalSelesai) {
      const startDate = tanggalMulai ? new Date(tanggalMulai) : existing.tanggalMulai;
      const endDate = tanggalSelesai ? new Date(tanggalSelesai) : existing.tanggalSelesai;

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json({
          error: 'Format tanggal tidak valid'
        }, { status: 400 });
      }

      if (startDate >= endDate) {
        return NextResponse.json({
          error: 'Tanggal mulai harus sebelum tanggal selesai'
        }, { status: 400 });
      }
    }

    // Jika isActive = true, nonaktifkan tahun akademik lain
    if (isActive && !existing.isActive) {
      await prisma.tahunAkademik.updateMany({
        where: {
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      });
    }

    const updatedTahunAkademik = await prisma.tahunAkademik.update({
      where: { id },
      data: {
        ...(tahun && { tahun }),
        ...(tanggalMulai && { tanggalMulai: new Date(tanggalMulai) }),
        ...(tanggalSelesai && { tanggalSelesai: new Date(tanggalSelesai) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // Log audit
    try {
      if (session.user.userId) {
        await prisma.auditLog.create({
          data: {
            userId: session.user.userId,
            userType: session.user.role,
            action: 'update_tahun_akademik',
            description: `Mengupdate tahun akademik: ${updatedTahunAkademik.tahun}`
          }
        });
      }
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
    }

    return NextResponse.json(updatedTahunAkademik);
  } catch (error) {
    console.error('Error updating tahun akademik:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: Hapus tahun akademik
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID tahun akademik diperlukan' }, { status: 400 });
    }

    // Check if record exists
    const existing = await prisma.tahunAkademik.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            periodeJalur: true,
            konfigurasiNilai: true,
            konfigurasiKuota: true
          }
        }
      }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tahun akademik tidak ditemukan' }, { status: 404 });
    }

    // Check if it's being used
    const totalUsage = (existing._count?.periodeJalur || 0) +
                      (existing._count?.konfigurasiNilai || 0) +
                      (existing._count?.konfigurasiKuota || 0);

    if (totalUsage > 0) {
      return NextResponse.json({
        error: 'Tahun akademik tidak dapat dihapus karena masih digunakan dalam konfigurasi lain',
        usage: {
          periodeJalur: existing._count?.periodeJalur || 0,
          konfigurasiNilai: existing._count?.konfigurasiNilai || 0,
          konfigurasiKuota: existing._count?.konfigurasiKuota || 0
        }
      }, { status: 400 });
    }

    await prisma.tahunAkademik.delete({
      where: { id }
    });

    // Log audit
    try {
      if (session.user.userId) {
        await prisma.auditLog.create({
          data: {
            userId: session.user.userId,
            userType: session.user.role,
            action: 'delete_tahun_akademik',
            description: `Menghapus tahun akademik: ${existing.tahun}`
          }
        });
      }
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
    }

    return NextResponse.json({ message: 'Tahun akademik berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting tahun akademik:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}