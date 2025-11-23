module.exports = (sequelize, DataTypes) => {
  const GeneralContractor = sequelize.define('GeneralContractor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true
  });

  GeneralContractor.associate = function(models) {
    GeneralContractor.belongsTo(models.User, { foreignKey: 'userId' });
    GeneralContractor.hasMany(models.Project, { foreignKey: 'gcId' });
    GeneralContractor.hasMany(models.TrustFactor, { foreignKey: 'gcId' });
    GeneralContractor.hasMany(models.ProjectWinner, { foreignKey: 'gcId' });
  };

  return GeneralContractor;
};
