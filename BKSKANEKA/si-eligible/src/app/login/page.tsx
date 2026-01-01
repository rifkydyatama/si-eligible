// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [role, setRole] = useState<'siswa' | 'admin'>('siswa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    identifier: '', // NISN atau Username
    password: '' // Tanggal Lahir atau Password
  });

  useEffect(() => {
    if (session?.user?.role) {
      router.push(session.user.role === 'siswa' ? '/siswa/dashboard' : '/admin/dashboard');
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(
        role === 'siswa' ? 'siswa-login' : 'admin-login',
        {
          redirect: false,
          callbackUrl: role === 'siswa' ? '/siswa/dashboard' : '/admin/dashboard',
          ...(role === 'siswa' 
            ? { nisn: formData.identifier, tanggalLahir: formData.password }
            : { username: formData.identifier, password: formData.password }
          )
        }
      );

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        // Session akan diupdate otomatis, useEffect akan handle redirect
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="text-white hover:text-pink-200 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4">
              SE
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Login Si-Eligible</h1>
            <p className="text-white/80">Pilih peran Anda untuk melanjutkan</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('siswa')}
              className={`p-4 rounded-xl border-2 transition ${
                role === 'siswa'
                  ? 'bg-white/20 border-white text-white'
                  : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
              }`}
            >
              <div className="text-3xl mb-2">👨‍🎓</div>
              <div className="font-semibold">Siswa</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-4 rounded-xl border-2 transition ${
                role === 'admin'
                  ? 'bg-white/20 border-white text-white'
                  : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
              }`}
            >
              <div className="text-3xl mb-2">👨‍💼</div>
              <div className="font-semibold">Admin/Guru BK</div>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-white text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                {role === 'siswa' ? 'NISN' : 'Username'}
              </label>
              <input
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder={role === 'siswa' ? 'Masukkan NISN' : 'Masukkan Username'}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                {role === 'siswa' ? 'Tanggal Lahir' : 'Password'}
              </label>
              <input
                type={role === 'siswa' ? 'date' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={role === 'siswa' ? '' : 'Masukkan Password'}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-linear-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-white/70 text-sm text-center mb-2">Demo Login:</p>
            <div className="text-xs text-white/60 space-y-1">
              <p>👨‍🎓 Siswa - NISN: <code className="bg-white/10 px-2 py-1 rounded">0012345678</code> | Tanggal Lahir: <code className="bg-white/10 px-2 py-1 rounded">2007-05-15</code></p>
              <p>👨‍💼 Admin - Username: <code className="bg-white/10 px-2 py-1 rounded">admin</code> | Password: <code className="bg-white/10 px-2 py-1 rounded">admin123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}