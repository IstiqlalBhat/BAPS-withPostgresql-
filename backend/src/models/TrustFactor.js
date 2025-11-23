module.exports = (sequelize, DataTypes) => {
  const TrustFactor = sequelize.define('TrustFactor', {
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
    gcId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'GeneralContractors',
        key: 'id'
      }
    },
    costConformity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10
      }
    },
    timeConformity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10
      }
    },
    qualityConformity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10
      }
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
    timestamps: true,
    hooks: {
      beforeSave: (trustFactor) => {
        const total = trustFactor.costConformity + trustFactor.timeConformity + trustFactor.qualityConformity;
        if (total > 30) {
          throw new Error('Total trust factor score cannot exceed 30');
        }
      }
    },
    indexes: [
      {
        fields: ['subcontractorId', 'gcId'],
        unique: true
      }
    ]
  });

  TrustFactor.associate = function(models) {
    TrustFactor.belongsTo(models.Subcontractor, { foreignKey: 'subcontractorId' });
    TrustFactor.belongsTo(models.GeneralContractor, { foreignKey: 'gcId' });
  };

  TrustFactor.prototype.getTotalScore = function() {
    return this.costConformity + this.timeConformity + this.qualityConformity;
  };

  return TrustFactor;
};
