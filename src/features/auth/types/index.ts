export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  // If backend uses HTTP-only cookies, token might not be here.
  // If it returns a token in the body:
  token?: string; 
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  image?: string;
}
