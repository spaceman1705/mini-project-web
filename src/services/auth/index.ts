import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export async function loginService(email: string, password: string) {
  try {
    const { data } = await axios.post(`${baseUrl}/auth/login`, {
      email,
      password,
    });

    return data;
  } catch (err) {
    throw err;
  }
}

export async function refreshTokenService(token: string) {
  try {
    const { data } = await axios.post(`${baseUrl}/auth/refresh`, {
      token,
    });

    return data;
  } catch (err) {
    throw err;
  }
}

export async function verificationLinkService(email: string) {
  try {
    console.log("📤 Sending verification link request...");
    console.log("👉 Base URL:", baseUrl);
    console.log("👉 Email:", email);

    const { data } = await axios.post(`${baseUrl}/auth/verification-link`, {
      email,
    });

    console.log("✅ Response data:", data);
    return data;
  } catch (err) {
    throw err;
  }
}

export async function verifyService(
  firstname: string,
  lastname: string,
  password: string,
  token: string
) {
  try {
    const { data } = await axios.post(
      `${baseUrl}/auth/verify`,
      {
        firstname,
        lastname,
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (err) {
    throw err;
  }
}