export interface DecodedToken {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  referralCode?: string; // ✅ Ganti dari refferalCode
  iat: number;
  exp: number;
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstname: string;
      lastname: string;
      role: string;
      referralCode?: string;
    };
    access_token: string; // Ganti dari accessToken untuk hindari konflik
    error?: string;
  }

  interface User {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    role: string;
    referralCode?: string; // ✅ Ganti dari refferalCode
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string;
    firstname?: string;
    lastname?: string;
    role?: string;
    referralCode?: string;
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }
}
