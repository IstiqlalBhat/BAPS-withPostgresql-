module.exports = (sequelize, DataTypes) => {
  const ProjectWinner = sequelize.define('ProjectWinner', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      },
      unique: true
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
    materialCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    laborCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    totalCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    contractStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    contractEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('SELECTED', 'AWARDED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'SELECTED'
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
      beforeSave: (winner) => {
        if (winner.materialCost && winner.laborCost) {
          winner.totalCost = parseFloat(winner.materialCost) + parseFloat(winner.laborCost);
        }
      }
    }
  });

  ProjectWinner.associate = function(models) {
    ProjectWinner.belongsTo(models.Project, { foreignKey: 'projectId' });
    ProjectWinner.belongsTo(models.Subcontractor, { foreignKey: 'subcontractorId' });
    ProjectWinner.belongsTo(models.GeneralContractor, { foreignKey: 'gcId' });
  };

  return ProjectWinner;
};
