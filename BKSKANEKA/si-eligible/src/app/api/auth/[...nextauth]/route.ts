// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

// use shared prisma instance from src/lib/prisma

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "siswa-login",
      name: "Siswa Login",
      credentials: {
        nisn: { label: "NISN", type: "text" },
        tanggalLahir: { label: "Tanggal Lahir", type: "date" }
      },
      async authorize(credentials) {
        if (!credentials?.nisn || !credentials?.tanggalLahir) {
          throw new Error("NISN dan Tanggal Lahir harus diisi");
        }

        const siswa = await prisma.siswa.findUnique({
          where: { nisn: credentials.nisn }
        });

        if (!siswa) {
          throw new Error("NISN tidak ditemukan");
        }

        const tanggalLahir = new Date(siswa.tanggalLahir)
          .toISOString()
          .split('T')[0];
        
        if (tanggalLahir !== credentials.tanggalLahir) {
          throw new Error("Tanggal lahir tidak sesuai");
        }

        return {
          id: siswa.id,
          name: siswa.nama,
          email: siswa.nisn,
          role: "siswa",
          nisn: siswa.nisn
        };
      }
    }),
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan Password harus diisi");
        }

        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username }
        });

        if (!admin || !admin.isActive) {
          throw new Error("Username tidak ditemukan atau tidak aktif");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          admin.password
        );

        if (!isValid) {
          throw new Error("Password salah");
        }

        return {
          id: admin.id,
          name: admin.nama,
          email: admin.email || admin.username,
          role: admin.role,
          username: admin.username
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.userId = token.userId as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
