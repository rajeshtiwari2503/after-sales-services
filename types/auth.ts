// export interface JWTPayload {
//   userId: string;
//   email: string;
//   role: UserRole;
//   tenantId: string;
//   iat?: number;
//   exp?: number;
// }
//  'support';

// export interface User {
//   _id: string;

//   name: string;
//   email: string;
//   password?: string;

//   role: UserRole;

//   tenantId: string;

//   phone?: string;
//   avatar?: string;

//   isActive: boolean;

//  lastLogin?: Date;

//   createdAt: string;
//   updatedAt: string;
// }
// // export type UserRole = 'admin' | 'manager' | 'technician' | 'customer' | 'support';

 
// export type UserRole =
//   | 'admin'           // Super Admin
//   | 'manager'         // Brand Manager
//   | 'service_center'  // Service Center operator
//   | 'technician'      // Field technician
//   | 'customer'        // End customer
//   | 'support';        // Support agent (existing)

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface RegisterData {
//   name: string;
//   email: string;
//   password: string;
//   role?: UserRole;
//   tenantId?: string;
  
// }

// export interface AuthResponse {
//   success: boolean;
//   message: string;
//   token?: string;
//   user?: {
//     id: string;
//     name: string;
//     email: string;
//     role: UserRole;
//   };
// }

// types/auth.ts  — REPLACE your existing file
// Only change: serviceCenterId added to JWTPayload

export type UserRole =
  | 'admin'           // Super Admin — full access all tenants
  | 'manager'         // Brand Manager — own brand only
  | 'service_center'  // SC Operator — own SC only
  | 'technician'      // Technician — own jobs only
  | 'customer'
  | 'support';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string;
  serviceCenterId?: string;   // ← NEW: set for service_center role
  iat?: number;
  exp?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  tenantId: string;
  serviceCenterId?: string;   // ← NEW
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: string;
  updatedAt: string;
}

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
    tenantId?: string;
    serviceCenterId?: string;
  };
}