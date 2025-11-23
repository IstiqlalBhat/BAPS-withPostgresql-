import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

// Initialize database on first request
let dbInitialized = false;

async function initDB() {
    if (!dbInitialized) {
        try {
            const { sequelize } = await import('@/lib/db');
            await sequelize.sync({ alter: true });
            console.log('✅ Database synced');
            dbInitialized = true;
        } catch (error) {
            console.error('❌ Database sync error:', error);
            throw error;
        }
    }
}

export async function POST(request: Request) {
    try {
        // Initialize DB if needed
        await initDB();

        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const result = await AuthService.login({ email, password });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Login error:', error);

        // Return JSON error instead of letting Next.js handle it
        return NextResponse.json(
            {
                error: error.message || 'Login failed',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: error.status || 401 }
        );
    }
}
