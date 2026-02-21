const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trip = sequelize.define('Trip', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tripNumber: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    vehicleId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    driverId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    driverName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    origin: {
        type: DataTypes.STRING,
        allowNull: false
    },
    destination: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cargo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cargoWeight: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Cargo weight in kg'
    },
    estimatedFuelCost: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('draft', 'dispatched', 'completed', 'cancelled'),
        defaultValue: 'draft',
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Trip;
