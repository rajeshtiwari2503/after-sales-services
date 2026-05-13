// import jwt from 'jsonwebtoken';
// import { JWTPayload } from '@/types/auth';

// const JWT_SECRET = process.env.JWT_SECRET!;
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// export function signToken(payload: JWTPayload): string {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
// }

// export function verifyToken(token: string): JWTPayload | null {
//   try {
//     return jwt.verify(token, JWT_SECRET) as JWTPayload;
//   } catch {
//     return null;
//   }
// }

// export function decodeToken(token: string): JWTPayload | null {
//   try {
//     return jwt.decode(token) as JWTPayload;
//   } catch {
//     return null;
//   }
// }


import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { JWTPayload } from "@/types/auth";

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;

const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}