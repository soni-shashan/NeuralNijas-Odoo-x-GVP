const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    registrationNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.ENUM('truck', 'van', 'bike'),
        allowNull: false
    },
    make: {
        type: DataTypes.STRING,
        allowNull: false
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('available', 'on-trip', 'in-shop', 'idle', 'retired'),
        defaultValue: 'available',
        allowNull: false
    },
    maxLoadCapacity: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Max load in tons'
    },
    region: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Default'
    },
    fuelType: {
        type: DataTypes.ENUM('diesel', 'petrol', 'electric', 'cng'),
        defaultValue: 'diesel'
    },
    mileage: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Vehicle;
