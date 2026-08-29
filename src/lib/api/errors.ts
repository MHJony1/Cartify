import { isAxiosError } from 'axios';

export class ApiError extends Error {
  public status?: number;
  public data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error: unknown): never => {
  if (error instanceof ApiError) {
    throw error;
  }
  
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    throw new ApiError(
      data?.message || error.message || 'An unexpected error occurred',
      error.response?.status,
      error.response?.data
    );
  }

  throw new ApiError('An unexpected error occurred');
};
