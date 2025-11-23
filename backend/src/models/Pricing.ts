import { DataTypes, Model, Sequelize } from 'sequelize';

export class Pricing extends Model {
    declare id: string;
    declare elementId: string;
    declare unitPrice: number;
    declare totalPrice: number;
    declare currency: string;
    declare aiSuggested: boolean;
    declare createdBy: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

let initialized = false;

export const initializePricing = (sequelize: Sequelize) => {
    if (initialized) return;

    Pricing.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            elementId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'elements',
                    key: 'id',
                },
            },
            unitPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            totalPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            currency: {
                type: DataTypes.STRING(3),
                allowNull: false,
                defaultValue: 'USD',
            },
            aiSuggested: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            createdBy: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'pricing',
            timestamps: true,
        }
    );

    initialized = true;
};
