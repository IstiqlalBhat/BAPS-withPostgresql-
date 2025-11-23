export const config = {
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        expiresIn: '24h',
    },
    oauth: {
        google: {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
        },
    },
};
