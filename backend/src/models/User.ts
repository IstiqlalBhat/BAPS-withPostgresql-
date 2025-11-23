import { DataTypes, Model, Sequelize } from 'sequelize';

// Get the sequelize instance lazily to avoid circular dependencies
let sequelizeInstance: Sequelize | null = null;

export function setSequelize(db: Sequelize) {
    sequelizeInstance = db;
    initializeModel();
}

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

let modelInitialized = false;

function initializeModel() {
    if (modelInitialized || !sequelizeInstance) return;

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
                type: DataTypes.ENUM('GC_ADMIN', 'GC_USER', 'VIEWER', 'SUBCONTRACTOR'),
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
            sequelize: sequelizeInstance,
            tableName: 'users',
            timestamps: true,
        }
    );

    modelInitialized = true;
}
