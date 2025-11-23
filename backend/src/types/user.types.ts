export interface User {
    id: string;
    email: string;
    password?: string;
    role: UserRole;
    googleId?: string;
    microsoftId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
    GC_ADMIN = 'GC_ADMIN',
    GC_USER = 'GC_USER',
    VIEWER = 'VIEWER'
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    role?: UserRole;
}

export interface AuthResponse {
    token: string;
    user: Omit<User, 'password'>;
}
