import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends NextAuthUser {
    email: string;
    firstname: string;
    lastname: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  }

  interface Session extends DefaultSession {
    user: {
      email: string;
      firstname: string;
      lastname: string;
      role: string;
    } | null;
    accessToken?: string | null;
    error?: string | null;
  }

  type AdapterUser = User;
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string | null;
    firstname?: string | null;
    lastname?: string | null;
    role?: string | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    error?: string | null;
  }
}