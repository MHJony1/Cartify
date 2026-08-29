export const env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  NEXT_PUBLIC_API_TIMEOUT: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
};
