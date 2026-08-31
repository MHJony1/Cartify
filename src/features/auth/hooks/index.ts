import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { LoginCredentials, RegisterCredentials } from '../types';

export const AUTH_KEYS = {
  currentUser: ['currentUser'] as const,
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: AUTH_KEYS.currentUser,
    queryFn: authApi.getCurrentUser,
    retry: false, // Don't retry if not authenticated
    // staleTime: 5 * 60 * 1000, // Customize as needed
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.currentUser, data.user);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.currentUser, data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear(); // Clear all queries on logout
    },
  });
};

export const useGoogleLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credential: string) => authApi.googleLogin(credential),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.currentUser, data.user);
    },
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File) => authApi.uploadImage(file),
  });
};
