const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceLog = sequelize.define('MaintenanceLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    logNumber: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    vehicleId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    issueType: {
        type: DataTypes.ENUM('engine', 'brakes', 'tires', 'electrical', 'transmission', 'oil-change', 'inspection', 'bodywork', 'other'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('new', 'in-progress', 'completed'),
        defaultValue: 'new',
        allowNull: false
    },
    serviceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    completedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = MaintenanceLog;
