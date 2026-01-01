// src/app/api/admin/sanggahan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'guru_bk')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const sanggahan = await prisma.sanggahan.findMany({
      where: { status },
      include: {
        siswa: {
          select: {
            id: true,
            nisn: true,
            nama: true,
            kelas: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(sanggahan);
  } catch (error) {
    console.error('Error fetching sanggahan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}