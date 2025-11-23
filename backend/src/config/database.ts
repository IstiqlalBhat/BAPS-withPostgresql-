import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/baps';

export const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

console.log('[DB] Sequelize instance exported successfully');

export async function connectDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Unable to connect to database:', error);
        throw error;
    }
}
