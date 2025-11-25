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
      accessToken: string;
    };
    accessToken?: string | null;
    error?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string | null;
    firstname?: string | null;
    lastname?: string | null;
    role?: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    error?: string | null;
  }
}
