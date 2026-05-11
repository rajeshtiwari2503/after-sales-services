import User from '@/models/User';
import { hashPassword, comparePassword } from '@/lib/hash';
import { signToken } from '@/lib/jwt';
import { LoginCredentials, RegisterData, AuthResponse, JWTPayload } from '@/types/auth';
import connectDB from '@/lib/db';

export class AuthService {
  static async register(data: RegisterData, tenantId: string): Promise<AuthResponse> {
    await connectDB();

    const existingUser = await User.findOne({ email: data.email, tenantId });
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'customer',
      tenantId,
    });

    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId,
    };

    const token = signToken(payload);

    return {
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async login(credentials: LoginCredentials, tenantId: string): Promise<AuthResponse> {
    await connectDB();

    const user = await User.findOne({ email: credentials.email, tenantId }).select('+password');
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Account is deactivated' };
    }

    const isValidPassword = await comparePassword(credentials.password, user.password);
    if (!isValidPassword) {
      return { success: false, message: 'Invalid credentials' };
    }

    user.lastLogin = new Date();
    await user.save();

    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId,
    };

    const token = signToken(payload);

    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async getUserById(userId: string) {
    await connectDB();
    return User.findById(userId).select('-password');
  }
}
