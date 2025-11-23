import { DataTypes, Model, Sequelize } from 'sequelize';

export class Element extends Model {
    declare id: string;
    declare name: string;
    declare category: string;
    declare quantity: number;
    declare unit: string;
    declare properties: Record<string, any>;
    declare bimMetadata: any;
    declare projectId: string | null;
    declare createdBy: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

let initialized = false;

export const initializeElement = (sequelize: Sequelize) => {
    if (initialized) return;

    Element.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            category: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            unit: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            properties: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            bimMetadata: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
            },
            projectId: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'elements',
            timestamps: true,
        }
    );

    initialized = true;
};
