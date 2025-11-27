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
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://mini-project-api-one.vercel.app/api';

    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // ✅ Hanya tambahkan token kalau ada session
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
          console.log('🔍 Token added to request');
        } else {
          console.log('🔍 No token (public request)');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        console.log('✅ Response success:', response.status);
        return response;
      },
      (error) => {
        console.error('❌ Response error:', error.response?.status, error.message);

        // Jangan reject kalau public route dan 401
        if (error.response?.status === 401 && !session) {
          console.log('ℹ️ 401 on public route - this is normal');
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [session]);

  return children;
}