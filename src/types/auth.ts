export interface DecodedToken {
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  exp: number;
}

export interface TokenType {
  email?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  role?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  error?: string | null;
}