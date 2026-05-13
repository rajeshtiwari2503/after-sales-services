export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string;
  iat?: number;
  exp?: number;
}
 'support';

export interface User {
  _id: string;

  name: string;
  email: string;
  password?: string;

  role: UserRole;

  tenantId: string;

  phone?: string;
  avatar?: string;

  isActive: boolean;

  lastLogin?: string;

  createdAt: string;
  updatedAt: string;
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
