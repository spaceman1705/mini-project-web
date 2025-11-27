import NextAuth, {
  DefaultSession,
  Session as NextAuthSession,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { isAxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

import { DecodedToken } from "@/types/auth";
import { loginService, refreshTokenService } from "@/services/auth";
import { decode } from "punycode";

// Custom session interface
interface CustomSession extends DefaultSession {
  user: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    role: string;
    referralCode: string;
  };
  access_token: string; // Ganti dari accessToken
  error?: string;
}

// Refresh access token helper
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) throw new Error("No refresh token");

    const data = await refreshTokenService(token.refreshToken);

    // Token ada di data.data level (sesuai backend response)
    const { accessToken, refreshToken } = data?.data ?? {};

    if (!accessToken) throw new Error("No access token from refresh");

    const decoded = jwtDecode<DecodedToken>(accessToken);

    return {
      ...token,
      email: decoded.email,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
      role: decoded.role,
      referralCode: decoded.referralCode || "",
      accessToken,
      refreshToken,
      error: undefined,
    };
  } catch (err) {
    console.error("refreshAccessToken error:", err);
    return {
      ...token,
      error: "RefreshTokenError",
    };
  }
}

const handler = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const data = await loginService(
            credentials.email,
            credentials.password,
          );

          // DEBUG: Log response dari backend
          console.log("Backend response:", JSON.stringify(data, null, 2));

          // Token ada di data.data level (sesuai backend response)
          const accessToken = data?.data?.accessToken;
          const refreshToken = data?.data?.refreshToken;

          // DEBUG: Log extracted tokens
          console.log("Access Token:", accessToken ? "EXISTS" : "MISSING");
          console.log("Refresh Token:", refreshToken ? "EXISTS" : "MISSING");

          if (!accessToken) {
            console.error("Full response:", data);
            throw new Error("Invalid access token from backend");
          }

          const decoded = jwtDecode<DecodedToken>(accessToken);

          return {
            id: decoded.email,
            email: decoded.email,
            firstname: decoded.firstname,
            lastname: decoded.lastname,
            role: decoded.role,
            referralCode: decoded.referralCode || "",
            accessToken,
            refreshToken,
          };
        } catch (err) {
          if (isAxiosError(err))
            console.error("Axios login error:", err.response?.data);
          else console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      // New login
      if (user) {
        return {
          ...token,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
          referralCode: user.referralCode || "",
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          error: undefined,
        };
      }

      // Check if token expired
      if (token.accessToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(token.accessToken);
          const isExpired = decoded.exp * 1000 < Date.now();
          if (!isExpired) return token;

          // Refresh token
          return await refreshAccessToken(token);
        } catch {
          return { ...token, error: "InvalidAccessToken" };
        }
      }

      return token;
    },

    async session({ session, token }): Promise<CustomSession> {
      if (token.error) {
        return {
          ...session,
          user: {
            id: "",
            email: "",
            firstname: "",
            lastname: "",
            role: "",
            referralCode: "",
          },
          access_token: "", // Ganti dari accessToken access_token
          error: token.error,
        };
      }

      return {
        ...session,
        user: {
          id: token.email ?? "",
          email: token.email ?? "",
          firstname: token.firstname ?? "",
          lastname: token.lastname ?? "",
          role: token.role ?? "",
          referralCode: token.referralCode ?? "",
        },
        access_token: token.accessToken ?? "", // Ganti dari accessToken
        error: token.error ?? undefined,
      };
    },
  },
});

export { handler as GET, handler as POST };
