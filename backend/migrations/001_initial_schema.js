'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('ADMIN', 'GENERAL_CONTRACTOR', 'SUBCONTRACTOR'),
        defaultValue: 'SUBCONTRACTOR'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create GeneralContractors table
    await queryInterface.createTable('GeneralContractors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      registrationNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      },
      zipCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Subcontractors table
    await queryInterface.createTable('Subcontractors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      registrationNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      },
      zipCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      certifications: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verificationDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Projects table
    await queryInterface.createTable('Projects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      projectCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      gcId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'GeneralContractors',
          key: 'id'
        }
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      workType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      scheduleFrom: {
        type: Sequelize.DATE,
        allowNull: false
      },
      scheduleTo: {
        type: Sequelize.DATE,
        allowNull: false
      },
      materialUnitCost: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      laborUnitCost: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      totalQuantity: {
        type: Sequelize.DECIMAL(15, 4),
        defaultValue: 0
      },
      totalConstructionCost: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'OPEN', 'MATCHING', 'AWARDED', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'DRAFT'
      },
      bimFileUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create SubcontractorData table
    await queryInterface.createTable('SubcontractorData', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      subcontractorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Subcontractors',
          key: 'id'
        }
      },
      availabilityFrom: {
        type: Sequelize.DATE,
        allowNull: false
      },
      availabilityTo: {
        type: Sequelize.DATE,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      workType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      materialCostPerSqm: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      laborCostPerSqm: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      maximumCapacity: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: true
      },
      currentUtilization: {
        type: Sequelize.DECIMAL(15, 4),
        defaultValue: 0
      },
      specialization: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create TrustFactors table
    await queryInterface.createTable('TrustFactors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      subcontractorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Subcontractors',
          key: 'id'
        }
      },
      gcId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'GeneralContractors',
          key: 'id'
        }
      },
      costConformity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      timeConformity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      qualityConformity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create ProjectMatches table
    await queryInterface.createTable('ProjectMatches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'id'
        }
      },
      subcontractorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Subcontractors',
          key: 'id'
        }
      },
      matchScore: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      trustScore: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      locationMatch: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      scheduleMatch: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      costEstimate: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'SELECTED'),
        defaultValue: 'PENDING'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create ProjectWinners table
    await queryInterface.createTable('ProjectWinners', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'Projects',
          key: 'id'
        }
      },
      subcontractorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Subcontractors',
          key: 'id'
        }
      },
      gcId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'GeneralContractors',
          key: 'id'
        }
      },
      materialCost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      laborCost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      totalCost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      contractStartDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      contractEndDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('SELECTED', 'AWARDED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'SELECTED'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes for faster queries
    await queryInterface.addIndex('Projects', ['gcId']);
    await queryInterface.addIndex('Projects', ['status']);
    await queryInterface.addIndex('SubcontractorData', ['subcontractorId']);
    await queryInterface.addIndex('TrustFactors', ['subcontractorId']);
    await queryInterface.addIndex('TrustFactors', ['gcId']);
    await queryInterface.addIndex('ProjectMatches', ['projectId']);
    await queryInterface.addIndex('ProjectMatches', ['subcontractorId']);
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes
    await queryInterface.removeIndex('ProjectMatches', ['subcontractorId']);
    await queryInterface.removeIndex('ProjectMatches', ['projectId']);
    await queryInterface.removeIndex('TrustFactors', ['gcId']);
    await queryInterface.removeIndex('TrustFactors', ['subcontractorId']);
    await queryInterface.removeIndex('SubcontractorData', ['subcontractorId']);
    await queryInterface.removeIndex('Projects', ['status']);
    await queryInterface.removeIndex('Projects', ['gcId']);

    // Drop tables in reverse order
    await queryInterface.dropTable('ProjectWinners');
    await queryInterface.dropTable('ProjectMatches');
    await queryInterface.dropTable('TrustFactors');
    await queryInterface.dropTable('SubcontractorData');
    await queryInterface.dropTable('Projects');
    await queryInterface.dropTable('Subcontractors');
    await queryInterface.dropTable('GeneralContractors');
    await queryInterface.dropTable('Users');
  }
};
