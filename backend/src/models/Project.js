module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    gcId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'GeneralContractors',
        key: 'id'
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    workType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scheduleFrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    scheduleTo: {
      type: DataTypes.DATE,
      allowNull: false
    },
    materialUnitCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    laborUnitCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalQuantity: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0
    },
    totalConstructionCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'OPEN', 'MATCHING', 'AWARDED', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'DRAFT'
    },
    bimFileUrl: {
      type: DataTypes.STRING,
      allowNull: true
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
      beforeSave: (project) => {
        // Calculate total construction cost
        if (project.totalQuantity && (project.materialUnitCost || project.laborUnitCost)) {
          const costPerUnit = parseFloat(project.materialUnitCost) + parseFloat(project.laborUnitCost);
          project.totalConstructionCost = costPerUnit * parseFloat(project.totalQuantity);
        }
      }
    }
  });

  Project.associate = function(models) {
    Project.belongsTo(models.GeneralContractor, { foreignKey: 'gcId' });
    Project.hasMany(models.ProjectMatch, { foreignKey: 'projectId' });
    Project.hasOne(models.ProjectWinner, { foreignKey: 'projectId' });
  };

  return Project;
};
