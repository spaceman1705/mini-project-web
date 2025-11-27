import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: "https://mini-project-api-one.vercel.app/api",
});

// Interceptor untuk tambahkan token ke setiap request
api.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

export default api;
