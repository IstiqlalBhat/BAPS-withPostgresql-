module.exports = (sequelize, DataTypes) => {
  const ProjectMatch = sequelize.define('ProjectMatch', {
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
      }
    },
    subcontractorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Subcontractors',
        key: 'id'
      }
    },
    matchScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    trustScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    locationMatch: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    scheduleMatch: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    costEstimate: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'SELECTED'),
      defaultValue: 'PENDING'
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

  ProjectMatch.associate = function(models) {
    ProjectMatch.belongsTo(models.Project, { foreignKey: 'projectId' });
    ProjectMatch.belongsTo(models.Subcontractor, { foreignKey: 'subcontractorId' });
  };

  return ProjectMatch;
};
