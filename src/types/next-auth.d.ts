import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends NextAuthUser {
    email: string;
    firstname: string;
    lastname: string;
    role: string;
    referralCode?: string; // ✅ Tambahkan ini (typo di config: refferalCode)
    accessToken: string;
    refreshToken: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string; // ✅ Tambahkan id
      email: string;
      firstname: string;
      lastname: string;
      role: string;
      referralCode?: string; // ✅ Tambahkan ini
    };
    access_token: string; // ✅ Ganti dari accessToken ke access_token
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string;
    firstname?: string;
    lastname?: string;
    role?: string;
    referralCode?: string; // ✅ Tambahkan ini
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }
}
