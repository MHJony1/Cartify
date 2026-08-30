import axios, { AxiosError } from 'axios';
import { env } from '@/config/env';

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: env.NEXT_PUBLIC_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response Interceptor for common error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // We can handle global error logging or notification here in the future.
    // For now, we'll just pass the error down to the caller.
    return Promise.reject(error);
  }
);
