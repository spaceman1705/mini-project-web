import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

export async function loginService(email: string, password: string) {
  try {
    const { data } = await axios.post(`${baseUrl}/auth/login`, {
      email,
      password,
    });

    // DEBUG: Log structure response dari backend
    console.log("🔍 Login Service Response:");
    console.log("📦 Full data:", JSON.stringify(data, null, 2));
    console.log("🔑 Keys:", Object.keys(data));

    // Cek apakah token ada di level root atau nested
    if (data.accessToken) {
      console.log("✅ accessToken found at root level");
    } else if (data.body?.accessToken) {
      console.log("✅ accessToken found at data.body level");
    } else if (data.access_token) {
      console.log("✅ access_token found at root level (snake_case)");
    } else if (data.body?.access_token) {
      console.log("✅ access_token found at data.body level (snake_case)");
    } else if (data.data?.accessToken) {
      console.log("✅ accessToken found at data.data level");
    } else {
      console.log("❌ No accessToken found in response!");
    }

    return data;
  } catch (err) {
    console.error("❌ Login Service Error:", err);
    throw err;
  }
}

export async function refreshTokenService(token: string) {
  try {
    const { data } = await axios.post(`${baseUrl}/auth/refresh`, {
      token,
    });

    console.log("🔄 Refresh Token Response:", data);
    return data;
  } catch (err) {
    console.error("❌ Refresh Token Error:", err);
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
  token: string,
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
      },
    );

    return data;
  } catch (err) {
    throw err;
  }
}

export async function apiFetch(
  endpoint: string,
  token?: string,
  options: RequestInit = {},
) {
  const res = await fetch(`${baseUrl}/profile`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
}
