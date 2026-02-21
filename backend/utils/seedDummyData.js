const { sequelize } = require('../config/database');
const { Vehicle, Trip, User, MaintenanceLog, Expense } = require('../models');

const seedDummyData = async () => {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.sync();

        console.log('🗑️ Cleaning existing dummy data (except users)...');
        await Expense.destroy({ where: {} });
        await MaintenanceLog.destroy({ where: {} });
        await Trip.destroy({ where: {} });
        await Vehicle.destroy({ where: {} });

        console.log('🚛 Seeding Vehicles...');
        const vehicles = await Vehicle.bulkCreate([
            // Available
            { registrationNumber: 'GJ-01-AB-1234', type: 'truck', make: 'Tata', model: 'Prima', year: 2022, status: 'available', fuelType: 'diesel', mileage: 45000, maxLoadCapacity: 12 },
            { registrationNumber: 'MH-02-EF-9012', type: 'van', make: 'Mahindra', model: 'Supro', year: 2023, status: 'available', fuelType: 'diesel', mileage: 18000, maxLoadCapacity: 1.5 },
            // On-Trip
            { registrationNumber: 'GJ-01-CD-5678', type: 'truck', make: 'Ashok Leyland', model: 'Captain', year: 2021, status: 'on-trip', fuelType: 'diesel', mileage: 62000, maxLoadCapacity: 16 },
            { registrationNumber: 'KA-01-MN-6789', type: 'truck', make: 'Eicher', model: 'Pro 3019', year: 2021, status: 'on-trip', fuelType: 'diesel', mileage: 72000, maxLoadCapacity: 19 },
            // In-Shop
            { registrationNumber: 'DL-05-IJ-7890', type: 'truck', make: 'BharatBenz', model: '1617R', year: 2020, status: 'in-shop', fuelType: 'diesel', mileage: 95000, maxLoadCapacity: 14 },
            // Idle
            { registrationNumber: 'KA-02-OP-1357', type: 'van', make: 'Force', model: 'Traveller', year: 2022, status: 'idle', fuelType: 'diesel', mileage: 25000, maxLoadCapacity: 2.5 }
        ], { returning: true });

        console.log(`✅ Seeded ${vehicles.length} vehicles.`);

        // Find specific vehicles for relationships
        const vAvail1 = vehicles[0];
        const vOnTrip1 = vehicles[2];
        const vOnTrip2 = vehicles[3];
        const vInShop = vehicles[4];

        // Fetch a dispatcher user to assign
        const dispatcher = await User.findOne({ where: { role: 'dispatcher' } });
        const driverId = dispatcher ? dispatcher.id : null;
        const driverName = dispatcher ? dispatcher.fullName : 'John Doe';

        console.log('🛣️ Seeding Trips...');
        // Let's create two completed trips in the past for the currently available vehicles
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5);

        const pastDateEnd = new Date();
        pastDateEnd.setDate(pastDateEnd.getDate() - 3);

        const trips = await Trip.bulkCreate([
            // Completed Trips
            { tripNumber: 101, vehicleId: vAvail1.id, driverId, driverName, origin: 'Mumbai', destination: 'Pune', cargo: 'Electronics', cargoWeight: 5000, status: 'completed', startDate: pastDate, endDate: pastDateEnd },
            { tripNumber: 102, vehicleId: vehicles[1].id, driverId: null, driverName: 'Ravi Kumar', origin: 'Delhi', destination: 'Agra', cargo: 'Textiles', cargoWeight: 1200, status: 'completed', startDate: pastDate, endDate: pastDateEnd },
            // Active Dispatched Trips
            { tripNumber: 103, vehicleId: vOnTrip1.id, driverId, driverName: 'Suresh Patel', origin: 'Surat', destination: 'Ahmedabad', cargo: 'Textiles', cargoWeight: 12000, status: 'dispatched', startDate: new Date() },
            { tripNumber: 104, vehicleId: vOnTrip2.id, driverId, driverName: 'Amit Singh', origin: 'Bangalore', destination: 'Chennai', cargo: 'Auto Parts', cargoWeight: 14000, status: 'dispatched', startDate: new Date() },
            // Draft
            { tripNumber: 105, vehicleId: null, driverId: null, driverName: null, origin: 'Delhi', destination: 'Jaipur', cargo: 'Furniture', cargoWeight: 2000, status: 'draft' },
            // Cancelled
            { tripNumber: 106, vehicleId: null, driverId: null, driverName: null, origin: 'Kolkata', destination: 'Patna', cargo: 'Medical Supplies', cargoWeight: 800, status: 'cancelled' }
        ], { returning: true });

        console.log(`✅ Seeded ${trips.length} trips.`);

        const completedTrip1 = trips[0];
        const completedTrip2 = trips[1];

        // -------------------------------------------------------------
        // Seeding Maintenance Logs
        // -------------------------------------------------------------
        console.log('🔧 Seeding Maintenance Logs...');
        const maintDate = new Date();
        maintDate.setDate(maintDate.getDate() - 1);

        const logs = await MaintenanceLog.bulkCreate([
            { logNumber: 501, vehicleId: vInShop.id, issueType: 'engine', description: 'Engine overheating on highway runs', cost: 0, status: 'new', serviceDate: new Date() },
            { logNumber: 502, vehicleId: vAvail1.id, issueType: 'brakes', description: 'Routine brake pad replacement', cost: 12000, status: 'completed', serviceDate: pastDate, completedDate: pastDateEnd }
        ]);

        console.log(`✅ Seeded ${logs.length} maintenance logs.`);

        // -------------------------------------------------------------
        // Seeding Expenses
        // -------------------------------------------------------------
        console.log('💰 Seeding Expenses...');
        const expenses = await Expense.bulkCreate([
            // Expenses for Trip 1
            { tripId: completedTrip1.id, vehicleId: completedTrip1.vehicleId, driverName: completedTrip1.driverName, type: 'fuel', fuelLiters: 150, fuelCost: 13500, miscExpense: 0, totalAmount: 13500, description: 'Fuel stop halfway', expenseDate: pastDateEnd, distance: 350 },
            { tripId: completedTrip1.id, vehicleId: completedTrip1.vehicleId, driverName: completedTrip1.driverName, type: 'toll', fuelLiters: 0, fuelCost: 0, miscExpense: 1200, totalAmount: 1200, description: 'Highway Tolls', expenseDate: pastDateEnd, distance: 0 },
            { tripId: completedTrip1.id, vehicleId: completedTrip1.vehicleId, driverName: completedTrip1.driverName, type: 'misc', fuelLiters: 0, fuelCost: 0, miscExpense: 500, totalAmount: 500, description: 'Driver meals', expenseDate: pastDateEnd, distance: 0 },

            // Expenses for Trip 2
            { tripId: completedTrip2.id, vehicleId: completedTrip2.vehicleId, driverName: completedTrip2.driverName, type: 'fuel', fuelLiters: 60, fuelCost: 5500, miscExpense: 0, totalAmount: 5500, description: 'Full tank', expenseDate: pastDateEnd, distance: 220 },
            { tripId: completedTrip2.id, vehicleId: completedTrip2.vehicleId, driverName: completedTrip2.driverName, type: 'parking', fuelLiters: 0, fuelCost: 0, miscExpense: 300, totalAmount: 300, description: 'Overnight parking', expenseDate: pastDateEnd, distance: 0 }
        ]);

        console.log(`✅ Seeded ${expenses.length} expenses.`);

        console.log('🎉 Full Dummy Data seeded successfully! You can jump straight to Analytics or Dispatch workflows.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed dummy data:', error);
        process.exit(1);
    }
};

seedDummyData();
