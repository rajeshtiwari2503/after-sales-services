export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export type UserRole = 'admin' | 'manager' | 'technician' | 'customer' | 'support';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  tenantId?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}
