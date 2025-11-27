"use client";

import { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface AxiosInterceptorProps {
  children: ReactNode;
}

export function AxiosInterceptor({ children }: AxiosInterceptorProps) {
  const { data: session } = useSession();

  useEffect(() => {
    // Setup default baseURL
    axios.defaults.baseURL = 'https://mini-project-api-one.vercel.app/api';

    // Setup interceptor untuk semua axios request
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Debug log (hapus setelah jalan)
        console.log('🔍 Session in interceptor:', session?.access_token ? 'Token exists' : 'No token');

        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Optional: Handle 401 response
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error('❌ 401 Unauthorized - Please login again');
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor saat component unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [session]);

  return <>{children}</>;
}