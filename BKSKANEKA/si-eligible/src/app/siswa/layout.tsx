// src/app/siswa/layout.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'siswa') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading' || status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'siswa')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const menuItems = [
    { href: '/siswa/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/siswa/verifikasi-nilai', icon: '✅', label: 'Verifikasi Nilai' },
    { href: '/siswa/peminatan', icon: '🎯', label: 'Peminatan Kampus' },
    { href: '/siswa/kelulusan', icon: '🎓', label: 'Lapor Kelulusan' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-64 h-full bg-white border-r border-gray-200 z-40">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-linear-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
              SE
            </div>
            <span className="font-bold text-xl text-gray-800">Si-Eligible</span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition text-gray-700 hover:text-purple-600"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          {session && session.user && (
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{session.user.name}</p>
                <p className="text-sm text-gray-500 truncate">Siswa</p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}