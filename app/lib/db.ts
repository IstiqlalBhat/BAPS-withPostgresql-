import { Sequelize } from 'sequelize';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/baps';

export const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

export async function connectDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Unable to connect to database:', error);
        throw error;
    }
}
