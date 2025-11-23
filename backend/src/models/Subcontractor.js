module.exports = (sequelize, DataTypes) => {
  const Subcontractor = sequelize.define('Subcontractor', {
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
    certifications: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationDate: {
      type: DataTypes.DATE,
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

  Subcontractor.associate = function(models) {
    Subcontractor.belongsTo(models.User, { foreignKey: 'userId' });
    Subcontractor.hasMany(models.SubcontractorData, { foreignKey: 'subcontractorId' });
    Subcontractor.hasMany(models.TrustFactor, { foreignKey: 'subcontractorId' });
    Subcontractor.hasMany(models.ProjectMatch, { foreignKey: 'subcontractorId' });
    Subcontractor.hasMany(models.ProjectWinner, { foreignKey: 'subcontractorId' });
  };

  return Subcontractor;
};
