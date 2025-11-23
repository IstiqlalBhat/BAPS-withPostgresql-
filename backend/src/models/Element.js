module.exports = (sequelize, DataTypes) => {
    const Element = sequelize.define('Element', {
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
    }, {
        tableName: 'elements',
        timestamps: true,
    });

    Element.associate = function (models) {
        // Define associations here if needed
        // Element.belongsTo(models.User, { foreignKey: 'createdBy' });
        // Element.belongsTo(models.Project, { foreignKey: 'projectId' });
    };

    return Element;
};
