module.exports = (sequelize, DataTypes) => {
  const SubcontractorData = sequelize.define('SubcontractorData', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    subcontractorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Subcontractors',
        key: 'id'
      }
    },
    availabilityFrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    availabilityTo: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    workType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    materialCostPerSqm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    laborCostPerSqm: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    maximumCapacity: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true
    },
    currentUtilization: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      defaultValue: 0
    },
    specialization: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    notes: {
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

  SubcontractorData.associate = function(models) {
    SubcontractorData.belongsTo(models.Subcontractor, { foreignKey: 'subcontractorId' });
  };

  return SubcontractorData;
};
