import { UserRole } from './auth';

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  tenantId: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}
