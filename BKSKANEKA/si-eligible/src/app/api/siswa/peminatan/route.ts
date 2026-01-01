import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'siswa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const peminatan = await prisma.peminatan.findMany({
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
      },
      orderBy: {
        pilihan: 'asc'
      }
    });

    return NextResponse.json(peminatan);
  } catch (error) {
    console.error('Error fetching peminatan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'siswa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { kampusId, jurusanId, pilihan, jalur } = await request.json();

    if (!kampusId || !jurusanId || !pilihan || !jalur) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if pilihan already exists for this student
    const existingPeminatan = await prisma.peminatan.findFirst({
      where: {
        siswaId: session.user.userId,
        pilihan: pilihan
      }
    });

    if (existingPeminatan) {
      // Update existing peminatan
      const updatedPeminatan = await prisma.peminatan.update({
        where: {
          id: existingPeminatan.id
        },
        data: {
          kampusId,
          jurusanId,
          jalur
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
      return NextResponse.json(updatedPeminatan);
    } else {
      // Create new peminatan
      const newPeminatan = await prisma.peminatan.create({
        data: {
          siswaId: session.user.userId,
          kampusId,
          jurusanId,
          pilihan,
          jalur
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
      return NextResponse.json(newPeminatan);
    }
  } catch (error) {
    console.error('Error creating/updating peminatan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'siswa') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pilihan = searchParams.get('pilihan');

    if (!pilihan) {
      return NextResponse.json({ error: 'Missing pilihan parameter' }, { status: 400 });
    }

    const deletedPeminatan = await prisma.peminatan.deleteMany({
      where: {
        siswaId: session.user.userId,
        pilihan: parseInt(pilihan)
      }
    });

    return NextResponse.json({ success: true, deleted: deletedPeminatan.count });
  } catch (error) {
    console.error('Error deleting peminatan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}