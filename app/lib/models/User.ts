import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class User extends Model {
    declare id: string;
    declare email: string;
    declare password: string | null;
    declare role: string;
    declare googleId: string | null;
    declare microsoftId: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true, // Null for OAuth users
        },
        role: {
            type: DataTypes.ENUM('GC_ADMIN', 'GC_USER', 'VIEWER'),
            allowNull: false,
            defaultValue: 'GC_USER',
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        microsoftId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
    }
);
