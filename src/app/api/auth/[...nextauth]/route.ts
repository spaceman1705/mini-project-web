import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { isAxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

import { DecodedToken, TokenType } from "@/types/auth";
import { loginService, refreshTokenService } from "@/services/auth";

async function refreshAccessToken(token: TokenType) {
  try {
    const data = await refreshTokenService(token.refreshToken as string);

    const { accessToken, refreshToken } = data?.body;

    const decoded = jwtDecode<DecodedToken>(accessToken);

    return {
      email: decoded.email,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
      role: decoded.role,
      accessToken,
      refreshToken,
      error: null,
    };
  } catch (err) {
    return {
      email: null,
      firstname: null,
      lastname: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      error: "RefreshTokenError",
    };
  }
}

const handler = NextAuth({
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        try {
          const data = await loginService(
            credentials?.email as string,
            credentials?.password as string
          );

          const { accessToken, refreshToken } = data?.body;

          if (!accessToken) {
            throw new Error("InvalidAccessToken");
          }

          const decoded = jwtDecode<DecodedToken>(accessToken);

          return {
            id: decoded.email,
            email: decoded.email,
            firstname: decoded.firstname,
            lastname: decoded.lastname,
            role: decoded.role,
            accessToken,
            refreshToken,
          };
        } catch (err) {
          if (isAxiosError(err)) {
            console.log(err.response?.data);
          }

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
        };
      }

      if (!token.accessToken) {
        return { ...token, error: "InvalidAccessToken" };
      }

      let decoded: DecodedToken;

      try {
        decoded = jwtDecode<DecodedToken>(token.accessToken as string);
      } catch {
        return { ...token, error: "InvalidAccessToken" };
      }

      const isExpired = decoded.exp * 1000 < Date.now();
      if (!isExpired) return token;

      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (
        !token ||
        token.error === "RefreshTokenError" ||
        token.error === "InvalidAccessToken"
      ) {
        return {
          ...session,
          user: null,
          accessToken: null,
          error: token?.error ?? "SessionExpired",
          expires: session.expires,
        };
      }

      return {
        ...session,
        user: {
          email: token.email,
          firstname: token.firstname,
          lastname: token.lastname,
          role: token.role,
        },
        accessToken: token.accessToken,
        error: token.error ?? null,
      };
    },
  },
});

export { handler as GET, handler as POST };