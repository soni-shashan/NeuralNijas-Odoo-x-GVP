const User = require('./User');
const Vehicle = require('./Vehicle');
const Trip = require('./Trip');
const MaintenanceLog = require('./MaintenanceLog');
const Expense = require('./Expense');

// Associations
Vehicle.hasMany(Trip, { foreignKey: 'vehicleId', as: 'trips' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

User.hasMany(Trip, { foreignKey: 'driverId', as: 'assignedTrips' });
Trip.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

Vehicle.hasMany(MaintenanceLog, { foreignKey: 'vehicleId', as: 'maintenanceLogs' });
MaintenanceLog.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Vehicle.hasMany(Expense, { foreignKey: 'vehicleId', as: 'expenses' });
Expense.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Trip.hasMany(Expense, { foreignKey: 'tripId', as: 'expenses' });
Expense.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });

module.exports = { User, Vehicle, Trip, MaintenanceLog, Expense };
