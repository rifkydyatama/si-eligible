// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      userId: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    nisn?: string;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    userId: string;
  }
}