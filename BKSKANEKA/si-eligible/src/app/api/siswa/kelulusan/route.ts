import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'siswa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kelulusan = await prisma.kelulusan.findUnique({
      where: {
        siswaId: session.user.userId
      },
      include: {
        kampus: {
          select: {
            id: true,
            namaKampus: true,
            jenisKampus: true,
            provinsi: true,
            kota: true
          }
        },
        jurusan: {
          select: {
            id: true,
            namaJurusan: true,
            jenjang: true,
            fakultas: true,
            akreditasi: true
          }
        }
      }
    });

    return NextResponse.json(kelulusan || null);
  } catch (error) {
    console.error('Error fetching kelulusan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'siswa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const status = formData.get('status') as string;
    const kampusId = formData.get('kampusId') as string;
    const jurusanId = formData.get('jurusanId') as string;
    const jalur = formData.get('jalur') as string;
    const buktiPenerimaan = formData.get('buktiPenerimaan') as File;

    if (!status || !kampusId || !jurusanId || !jalur) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (status === 'lulus' && !buktiPenerimaan) {
      return NextResponse.json({ error: 'Bukti penerimaan wajib diupload untuk status lulus' }, { status: 400 });
    }

    let buktiPenerimaanPath = '';

    // Handle file upload if bukti penerimaan is provided
    if (buktiPenerimaan) {
      const bytes = await buktiPenerimaan.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'kelulusan');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist, continue
      }

      // Generate unique filename
      const filename = `${session.user.userId}_${Date.now()}_${buktiPenerimaan.name}`;
      const filepath = join(uploadsDir, filename);

      await writeFile(filepath, buffer);
      buktiPenerimaanPath = `/uploads/kelulusan/${filename}`;
    }

    // Check if kelulusan already exists
    const existingKelulusan = await prisma.kelulusan.findUnique({
      where: {
        siswaId: session.user.userId
      }
    });

    if (existingKelulusan) {
      // Update existing kelulusan
      const updatedKelulusan = await prisma.kelulusan.update({
        where: {
          id: existingKelulusan.id
        },
        data: {
          status,
          kampusId,
          jurusanId,
          jalur,
          ...(buktiPenerimaanPath && { buktiPenerimaan: buktiPenerimaanPath })
        },
        include: {
          kampus: {
            select: {
              id: true,
              namaKampus: true,
              jenisKampus: true,
              provinsi: true,
              kota: true
            }
          },
          jurusan: {
            select: {
              id: true,
              namaJurusan: true,
              jenjang: true,
              fakultas: true,
              akreditasi: true
            }
          }
        }
      });
      return NextResponse.json(updatedKelulusan);
    } else {
      // Create new kelulusan
      const newKelulusan = await prisma.kelulusan.create({
        data: {
          siswaId: session.user.userId,
          status,
          kampusId,
          jurusanId,
          jalur,
          buktiPenerimaan: buktiPenerimaanPath
        },
        include: {
          kampus: {
            select: {
              id: true,
              namaKampus: true,
              jenisKampus: true,
              provinsi: true,
              kota: true
            }
          },
          jurusan: {
            select: {
              id: true,
              namaJurusan: true,
              jenjang: true,
              fakultas: true,
              akreditasi: true
            }
          }
        }
      });
      return NextResponse.json(newKelulusan);
    }
  } catch (error) {
    console.error('Error creating/updating kelulusan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'siswa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedKelulusan = await prisma.kelulusan.deleteMany({
      where: {
        siswaId: session.user.userId
      }
    });

    return NextResponse.json({ success: true, deleted: deletedKelulusan.count });
  } catch (error) {
    console.error('Error deleting kelulusan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}