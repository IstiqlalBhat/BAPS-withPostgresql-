import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/auth';
import { JWTPayload, AuthResponse, LoginRequest, RegisterRequest, UserRole } from '@common/types/user.types';
import { User } from '../models/User';

/**
 * Authentication service for user login, registration, and token management
 */
export class AuthService {
    /**
     * Register a new user
     */
    static async register(data: RegisterRequest): Promise<AuthResponse> {
        // Check if user exists
        const existingUser = await User.findOne({ where: { email: data.email } });
        if (existingUser) {
            throw { status: 400, message: 'User already exists' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await User.create({
            email: data.email,
            password: hashedPassword,
            role: data.role || UserRole.GC_USER,
        });

        // Generate token
        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role as UserRole,
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role as UserRole,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }

    /**
     * Login with email and password
     */
    static async login(data: LoginRequest): Promise<AuthResponse> {
        const user = await User.findOne({ where: { email: data.email } });

        if (!user || !user.password) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role as UserRole,
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role as UserRole,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }

    /**
     * OAuth: Find or create user from OAuth provider
     */
    static async findOrCreateOAuthUser(
        profile: { id: string; email: string; provider: 'google' | 'microsoft' }
    ): Promise<AuthResponse> {
        const field = profile.provider === 'google' ? 'googleId' : 'microsoftId';

        let user = await User.findOne({ where: { [field]: profile.id } });

        if (!user) {
            // Create new user
            user = await User.create({
                email: profile.email,
                [field]: profile.id,
                role: UserRole.GC_USER,
            });
        }

        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role as UserRole,
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role as UserRole,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }

    /**
     * Generate JWT token
     */
    private static generateToken(payload: JWTPayload): string {
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        } as SignOptions);
    }
}
