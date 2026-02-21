const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tripId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    vehicleId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    driverName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('fuel', 'toll', 'repair', 'parking', 'misc'),
        allowNull: false
    },
    fuelLiters: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    fuelCost: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    miscExpense: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    expenseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    distance: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Distance in km'
    }
}, {
    timestamps: true
});

module.exports = Expense;
