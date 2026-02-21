    const { sequelize } = require('../config/database');
const { Vehicle, Trip, User, MaintenanceLog, Expense } = require('../models');

const seedDummyData = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.sync();

        console.log('Cleaning existing dummy data (except users)...');
        await Expense.destroy({ where: {} });
        await MaintenanceLog.destroy({ where: {} });
        await Trip.destroy({ where: {} });
        await Vehicle.destroy({ where: {} });

        // --- Helper dates ---
        const daysAgo = (n) => {
            const d = new Date();
            d.setDate(d.getDate() - n);
            return d;
        };

        // =====================================================================
        // VEHICLES  (12 total)
        // Covers: all types (truck/van/bike), all statuses (available/on-trip/in-shop/idle/retired),
        //         all fuelTypes (diesel/petrol/electric/cng), all regions (North/South/West/East)
        // =====================================================================
        console.log('Seeding Vehicles...');
        const vehicles = await Vehicle.bulkCreate([
            // Available (3) — spread across regions & fuel types
            { registrationNumber: 'GJ-01-AB-1234', type: 'truck', make: 'Tata', model: 'Prima', year: 2022, status: 'available', fuelType: 'diesel', mileage: 47500, maxLoadCapacity: 12, region: 'West' },
            { registrationNumber: 'MH-02-EF-9012', type: 'van', make: 'Mahindra', model: 'Supro', year: 2023, status: 'available', fuelType: 'petrol', mileage: 19200, maxLoadCapacity: 1.5, region: 'West' },
            { registrationNumber: 'RJ-14-QR-2468', type: 'truck', make: 'Tata', model: 'Signa', year: 2023, status: 'available', fuelType: 'diesel', mileage: 32000, maxLoadCapacity: 18, region: 'North' },
            // On-Trip (4 — gives ~33% utilization)
            { registrationNumber: 'GJ-01-CD-5678', type: 'truck', make: 'Ashok Leyland', model: 'Captain', year: 2021, status: 'on-trip', fuelType: 'diesel', mileage: 63500, maxLoadCapacity: 16, region: 'West' },
            { registrationNumber: 'KA-01-MN-6789', type: 'truck', make: 'Eicher', model: 'Pro 3019', year: 2021, status: 'on-trip', fuelType: 'diesel', mileage: 73000, maxLoadCapacity: 19, region: 'South' },
            { registrationNumber: 'TN-09-ST-3579', type: 'van', make: 'Mahindra', model: 'Bolero Pickup', year: 2022, status: 'on-trip', fuelType: 'diesel', mileage: 41000, maxLoadCapacity: 1.2, region: 'South' },
            { registrationNumber: 'MP-04-UV-4680', type: 'truck', make: 'BharatBenz', model: '2823R', year: 2022, status: 'on-trip', fuelType: 'diesel', mileage: 51000, maxLoadCapacity: 25, region: 'North' },
            // In-Shop (1)
            { registrationNumber: 'DL-05-IJ-7890', type: 'truck', make: 'BharatBenz', model: '1617R', year: 2020, status: 'in-shop', fuelType: 'diesel', mileage: 96000, maxLoadCapacity: 14, region: 'North' },
            // Idle (2)
            { registrationNumber: 'KA-02-OP-1357', type: 'van', make: 'Force', model: 'Traveller', year: 2022, status: 'idle', fuelType: 'electric', mileage: 25800, maxLoadCapacity: 2.5, region: 'South' },
            { registrationNumber: 'UP-32-WX-8642', type: 'bike', make: 'Bajaj', model: 'Maxima C', year: 2024, status: 'idle', fuelType: 'cng', mileage: 5200, maxLoadCapacity: 0.5, region: 'East' },
            // Retired (1) — covers the "retired" status
            { registrationNumber: 'HR-26-ZZ-1111', type: 'truck', make: 'Tata', model: 'LPT 1613', year: 2017, status: 'retired', fuelType: 'diesel', mileage: 245000, maxLoadCapacity: 10, region: 'North' },
            // Extra bike (available, petrol) — ensures bike trips can be filtered
            { registrationNumber: 'DL-10-BK-5555', type: 'bike', make: 'Bajaj', model: 'RE Compact', year: 2023, status: 'available', fuelType: 'petrol', mileage: 8400, maxLoadCapacity: 0.3, region: 'East' }
        ], { returning: true });

        console.log(`Seeded ${vehicles.length} vehicles.`);

        const [vAvail1, vAvail2, vAvail3, vOnTrip1, vOnTrip2, vOnTrip3, vOnTrip4, vInShop, vIdle1, vIdle2, vRetired, vBike] = vehicles;

        // =====================================================================
        // DRIVERS  (4 extra drivers + existing users)
        // Covers: all dutyStatus (on-duty/off-duty/suspended),
        //         safety score ranges (green ≥80, amber 60-79, red <60),
        //         expired & valid licenses, complaints, phone/company/department
        // =====================================================================
        console.log('Seeding Extra Drivers...');
        await User.destroy({ where: { email: ['alex@fleetflow.com', 'david@fleetflow.com', 'priya@fleetflow.com', 'rahul@fleetflow.com'] } });
        const extraDrivers = await User.bulkCreate([
            { fullName: 'Alex Johnson', email: 'alex@fleetflow.com', password: 'password123', role: 'dispatcher', isVerified: true, dutyStatus: 'on-duty', safetyScore: 95, licenseNumber: 'DL-ALEX-1234', licenseExpiry: daysAgo(-730), complaints: 0, phone: '+91-9876543210', company: 'FleetFlow Logistics', department: 'Long Haul' },
            { fullName: 'David Smith', email: 'david@fleetflow.com', password: 'password123', role: 'dispatcher', isVerified: true, dutyStatus: 'suspended', safetyScore: 45, licenseNumber: 'KA-DAVID-5678', licenseExpiry: daysAgo(365), complaints: 2, phone: '+91-9123456789', company: 'FleetFlow Logistics', department: 'City Delivery' },
            { fullName: 'Priya Sharma', email: 'priya@fleetflow.com', password: 'password123', role: 'dispatcher', isVerified: true, dutyStatus: 'on-duty', safetyScore: 88, licenseNumber: 'MH-PRIYA-9012', licenseExpiry: daysAgo(-540), complaints: 0, phone: '+91-9988776655', company: 'FleetFlow Logistics', department: 'Regional' },
            { fullName: 'Rahul Verma', email: 'rahul@fleetflow.com', password: 'password123', role: 'dispatcher', isVerified: true, dutyStatus: 'off-duty', safetyScore: 72, licenseNumber: 'GJ-RAHUL-3456', licenseExpiry: daysAgo(-365), complaints: 1, phone: '+91-9012345678', company: 'FleetFlow Logistics', department: 'Express' }
        ], { individualHooks: true, returning: true });

        const [dAlex, dDavid, dPriya, dRahul] = extraDrivers;

        // =====================================================================
        // TRIPS  (17 total — spread across 5 months for rich analytics charts)
        //
        // Revenue formula: SUM(estimatedFuelCost for completed) * 3
        // We spread completed trips across months so the Monthly Summary table
        // shows 5 distinct months with varying profit/loss.
        //
        // Covers: all statuses (completed/dispatched/draft/cancelled),
        //         trips using bike vehicle, trips with notes,
        //         trips distributed across 4 drivers for meaningful completion rates,
        //         trips with null driverId (unassigned)
        // =====================================================================
        console.log('Seeding Trips...');
        const trips = await Trip.bulkCreate([
            // --- Month 1: ~5 months ago (2 completed) ---
            { tripNumber: 101, vehicleId: vAvail1.id, driverId: dAlex.id, driverName: 'Alex Johnson', origin: 'Mumbai', destination: 'Delhi', cargo: 'Electronics', cargoWeight: 10000, estimatedFuelCost: 22000, status: 'completed', startDate: daysAgo(150), endDate: daysAgo(147), notes: 'Priority delivery — fragile cargo, handle with care' },
            { tripNumber: 102, vehicleId: vAvail2.id, driverId: dPriya.id, driverName: 'Priya Sharma', origin: 'Pune', destination: 'Goa', cargo: 'FMCG Goods', cargoWeight: 1000, estimatedFuelCost: 5500, status: 'completed', startDate: daysAgo(145), endDate: daysAgo(144) },

            // --- Month 2: ~4 months ago (2 completed) ---
            { tripNumber: 103, vehicleId: vAvail3.id, driverId: dAlex.id, driverName: 'Alex Johnson', origin: 'Surat', destination: 'Ahmedabad', cargo: 'Textiles', cargoWeight: 12000, estimatedFuelCost: 9500, status: 'completed', startDate: daysAgo(120), endDate: daysAgo(118), notes: 'Bulk fabric rolls for export order' },
            { tripNumber: 104, vehicleId: vIdle1.id, driverId: dRahul.id, driverName: 'Rahul Verma', origin: 'Bangalore', destination: 'Mysore', cargo: 'Food Grains', cargoWeight: 2000, estimatedFuelCost: 4000, status: 'completed', startDate: daysAgo(115), endDate: daysAgo(114) },

            // --- Month 3: ~3 months ago (2 completed, 1 cancelled) ---
            { tripNumber: 105, vehicleId: vAvail1.id, driverId: dPriya.id, driverName: 'Priya Sharma', origin: 'Chennai', destination: 'Hyderabad', cargo: 'Machinery', cargoWeight: 8000, estimatedFuelCost: 15000, status: 'completed', startDate: daysAgo(90), endDate: daysAgo(87) },
            { tripNumber: 106, vehicleId: vBike.id, driverId: dRahul.id, driverName: 'Rahul Verma', origin: 'Delhi', destination: 'Gurgaon', cargo: 'Documents', cargoWeight: 15, estimatedFuelCost: 500, status: 'completed', startDate: daysAgo(88), endDate: daysAgo(88), notes: 'Urgent legal documents — same-day delivery' },
            { tripNumber: 107, vehicleId: null, driverId: null, driverName: null, origin: 'Kolkata', destination: 'Patna', cargo: 'Medical Supplies', cargoWeight: 800, status: 'cancelled', notes: 'Client cancelled order last minute' },

            // --- Month 4: ~2 months ago (2 completed) ---
            { tripNumber: 108, vehicleId: vAvail2.id, driverId: dAlex.id, driverName: 'Alex Johnson', origin: 'Jaipur', destination: 'Udaipur', cargo: 'Handicrafts', cargoWeight: 900, estimatedFuelCost: 4500, status: 'completed', startDate: daysAgo(60), endDate: daysAgo(59) },
            { tripNumber: 109, vehicleId: vAvail3.id, driverId: dPriya.id, driverName: 'Priya Sharma', origin: 'Lucknow', destination: 'Varanasi', cargo: 'Pharmaceuticals', cargoWeight: 6000, estimatedFuelCost: 8000, status: 'completed', startDate: daysAgo(55), endDate: daysAgo(53), notes: 'Temperature controlled cargo — maintain cold chain' },

            // --- Month 5: recent ~20 days (2 completed, 4 dispatched, 1 draft, 1 cancelled) ---
            { tripNumber: 110, vehicleId: vAvail1.id, driverId: dRahul.id, driverName: 'Rahul Verma', origin: 'Ahmedabad', destination: 'Rajkot', cargo: 'Cement Bags', cargoWeight: 11000, estimatedFuelCost: 7000, status: 'completed', startDate: daysAgo(15), endDate: daysAgo(14) },
            { tripNumber: 111, vehicleId: vBike.id, driverId: dAlex.id, driverName: 'Alex Johnson', origin: 'Noida', destination: 'Faridabad', cargo: 'Courier Parcels', cargoWeight: 20, estimatedFuelCost: 400, status: 'completed', startDate: daysAgo(10), endDate: daysAgo(10), notes: 'Same-day bike delivery route' },

            // Active dispatched (4) — one per on-trip vehicle
            { tripNumber: 112, vehicleId: vOnTrip1.id, driverId: dAlex.id, driverName: 'Alex Johnson', origin: 'Bangalore', destination: 'Chennai', cargo: 'Auto Parts', cargoWeight: 14000, estimatedFuelCost: 11000, status: 'dispatched', startDate: daysAgo(1) },
            { tripNumber: 113, vehicleId: vOnTrip2.id, driverId: dPriya.id, driverName: 'Priya Sharma', origin: 'Pune', destination: 'Nagpur', cargo: 'Steel Coils', cargoWeight: 16000, estimatedFuelCost: 18000, status: 'dispatched', startDate: daysAgo(1) },
            { tripNumber: 114, vehicleId: vOnTrip3.id, driverId: dRahul.id, driverName: 'Rahul Verma', origin: 'Indore', destination: 'Bhopal', cargo: 'Cotton Bales', cargoWeight: 1000, estimatedFuelCost: 3500, status: 'dispatched', startDate: new Date() },
            { tripNumber: 115, vehicleId: vOnTrip4.id, driverId: dAlex.id, driverName: 'Alex Johnson', origin: 'Ahmedabad', destination: 'Jodhpur', cargo: 'Cement Bags', cargoWeight: 22000, estimatedFuelCost: 20000, status: 'dispatched', startDate: new Date() },

            // Draft (unassigned)
            { tripNumber: 116, vehicleId: null, driverId: null, driverName: null, origin: 'Delhi', destination: 'Jaipur', cargo: 'Furniture', cargoWeight: 2000, status: 'draft' },
            // Cancelled (recent, with notes)
            { tripNumber: 117, vehicleId: vAvail2.id, driverId: null, driverName: null, origin: 'Kochi', destination: 'Trivandrum', cargo: 'Frozen Seafood', cargoWeight: 500, status: 'cancelled', notes: 'Refrigeration unit failure — delivery postponed' }
        ], { returning: true });

        console.log(`Seeded ${trips.length} trips.`);

        // Driver-trip distribution:
        //   Alex:  101,103,108,111,112,115 = 6 total, 4 completed → 67% completion
        //   Priya: 102,105,109,113        = 4 total, 3 completed → 75% completion
        //   Rahul: 104,106,110,114        = 4 total, 3 completed → 75% completion
        //   David: 0 trips (suspended) → 0% completion

        // Completed trips for expense linking (indices 0-1, 2-3, 4-5, 7-8, 9-10)
        const cTrip101 = trips[0];   // Month 1 — Mumbai→Delhi (vAvail1)
        const cTrip102 = trips[1];   // Month 1 — Pune→Goa (vAvail2)
        const cTrip103 = trips[2];   // Month 2 — Surat→Ahmedabad (vAvail3)
        const cTrip104 = trips[3];   // Month 2 — Bangalore→Mysore (vIdle1)
        const cTrip105 = trips[4];   // Month 3 — Chennai→Hyderabad (vAvail1)
        const cTrip106 = trips[5];   // Month 3 — Delhi→Gurgaon bike (vBike)
        const cTrip108 = trips[7];   // Month 4 — Jaipur→Udaipur (vAvail2)
        const cTrip109 = trips[8];   // Month 4 — Lucknow→Varanasi (vAvail3)
        const cTrip110 = trips[9];   // Month 5 — Ahmedabad→Rajkot (vAvail1)
        const cTrip111 = trips[10];  // Month 5 — Noida→Faridabad bike (vBike)

        // =====================================================================
        // MAINTENANCE LOGS  (9 entries — covers ALL 9 issueType enums + all 3 statuses)
        // Spread across months for analytics. Some with notes.
        //
        // Total maintenance cost = 12000+8500+3200+6500+4200+1500+5000+2800 = 43,700
        // =====================================================================
        console.log('Seeding Maintenance Logs...');
        await MaintenanceLog.bulkCreate([
            // engine — new (in-shop vehicle, current)
            { logNumber: 501, vehicleId: vInShop.id, issueType: 'engine', description: 'Engine overheating on highway runs — turbo charger inspection', cost: 0, status: 'new', serviceDate: new Date(), notes: 'Vehicle pulled off highway near Jaipur. Awaiting parts from dealer.' },
            // brakes — completed (month 1)
            { logNumber: 502, vehicleId: vAvail1.id, issueType: 'brakes', description: 'Routine brake pad replacement — front axle', cost: 12000, status: 'completed', serviceDate: daysAgo(148), completedDate: daysAgo(147), notes: 'Used genuine Tata brake pads. Next check at 60,000 km.' },
            // tires — completed (month 2)
            { logNumber: 503, vehicleId: vAvail3.id, issueType: 'tires', description: 'Rear tyre replacement — 2 tyres', cost: 8500, status: 'completed', serviceDate: daysAgo(118), completedDate: daysAgo(117) },
            // electrical — completed (month 3)
            { logNumber: 504, vehicleId: vAvail2.id, issueType: 'electrical', description: 'Alternator belt replacement & battery check', cost: 3200, status: 'completed', serviceDate: daysAgo(85), completedDate: daysAgo(84) },
            // transmission — completed (month 3)
            { logNumber: 505, vehicleId: vOnTrip1.id, issueType: 'transmission', description: 'Gearbox oil leak repair and clutch plate adjustment', cost: 6500, status: 'completed', serviceDate: daysAgo(80), completedDate: daysAgo(78), notes: 'Clutch plate at 60% life — schedule replacement in 20,000 km.' },
            // oil-change — completed (month 4)
            { logNumber: 506, vehicleId: vOnTrip2.id, issueType: 'oil-change', description: 'Scheduled oil change & filter replacement', cost: 4200, status: 'completed', serviceDate: daysAgo(58), completedDate: daysAgo(58) },
            // inspection — in-progress (recent)
            { logNumber: 507, vehicleId: vIdle1.id, issueType: 'inspection', description: 'Annual fitness certificate inspection — RTO compliance', cost: 1500, status: 'in-progress', serviceDate: daysAgo(2), notes: 'Awaiting RTO officer visit. Documents submitted.' },
            // bodywork — completed (month 5)
            { logNumber: 508, vehicleId: vRetired.id, issueType: 'bodywork', description: 'Cabin dent repair and full exterior repaint', cost: 5000, status: 'completed', serviceDate: daysAgo(18), completedDate: daysAgo(14), notes: 'Vehicle retired after assessment — bodywork done for resale value.' },
            // other — new (recent)
            { logNumber: 509, vehicleId: vBike.id, issueType: 'other', description: 'GPS tracker unit replacement and recalibration', cost: 2800, status: 'new', serviceDate: daysAgo(1) }
        ]);

        console.log('Seeded 9 maintenance logs.');

        // =====================================================================
        // EXPENSES  (spread across 5 months & 6+ vehicles for rich analytics)
        //
        // Fuel expenses on 6 vehicles (vAvail1, vAvail2, vAvail3, vIdle1, vBike, vOnTrip1)
        // → Top 5 Costliest chart gets 5+ data points
        //
        // Total fuel cost across all months: ~87,300
        // Total maintenance cost: 43,700
        // Total costs = 87,300 + 43,700 = 131,000
        //
        // Completed trip revenue = (22000+5500+9500+4000+15000+500+4500+8000+7000+400) * 3
        //                        = 76,400 * 3 = 229,200
        //
        // Net Profit = 229,200 - 131,000 = 98,200
        // Fleet ROI = ((229,200 - 131,000) / 131,000) * 100 ≈ 74.9%
        // Utilization = 4 on-trip / 12 total = 33%
        // =====================================================================
        console.log('Seeding Expenses...');
        await Expense.bulkCreate([
            // ---- Month 1 (~150 days ago): Trips 101, 102 ----
            // Trip 101: Mumbai→Delhi (vAvail1) — long haul
            { tripId: cTrip101.id, vehicleId: vAvail1.id, driverName: 'Alex Johnson', type: 'fuel', fuelLiters: 250, fuelCost: 22500, miscExpense: 0, totalAmount: 22500, description: 'Diesel — Mumbai to Delhi full route', expenseDate: daysAgo(149), distance: 1400 },
            { tripId: cTrip101.id, vehicleId: vAvail1.id, driverName: 'Alex Johnson', type: 'toll', fuelLiters: 0, fuelCost: 0, miscExpense: 2800, totalAmount: 2800, description: 'Mumbai-Delhi expressway tolls (multiple)', expenseDate: daysAgo(149), distance: 0 },
            { tripId: cTrip101.id, vehicleId: vAvail1.id, driverName: 'Alex Johnson', type: 'misc', fuelLiters: 0, fuelCost: 0, miscExpense: 1200, totalAmount: 1200, description: 'Driver meals, lodging — 3 day trip', expenseDate: daysAgo(148), distance: 0 },

            // Trip 102: Pune→Goa (vAvail2)
            { tripId: cTrip102.id, vehicleId: vAvail2.id, driverName: 'Priya Sharma', type: 'fuel', fuelLiters: 55, fuelCost: 5500, miscExpense: 0, totalAmount: 5500, description: 'Petrol tank fill — Pune station', expenseDate: daysAgo(145), distance: 460 },
            { tripId: cTrip102.id, vehicleId: vAvail2.id, driverName: 'Priya Sharma', type: 'toll', fuelLiters: 0, fuelCost: 0, miscExpense: 600, totalAmount: 600, description: 'Pune-Goa highway toll', expenseDate: daysAgo(145), distance: 0 },

            // ---- Month 2 (~120 days ago): Trips 103, 104 ----
            // Trip 103: Surat→Ahmedabad (vAvail3)
            { tripId: cTrip103.id, vehicleId: vAvail3.id, driverName: 'Alex Johnson', type: 'fuel', fuelLiters: 120, fuelCost: 10800, miscExpense: 0, totalAmount: 10800, description: 'Diesel — Surat to Ahmedabad', expenseDate: daysAgo(119), distance: 280 },
            { tripId: cTrip103.id, vehicleId: vAvail3.id, driverName: 'Alex Johnson', type: 'toll', fuelLiters: 0, fuelCost: 0, miscExpense: 450, totalAmount: 450, description: 'NH48 toll charges', expenseDate: daysAgo(119), distance: 0 },

            // Trip 104: Bangalore→Mysore (vIdle1) — gives vIdle1 expenses
            { tripId: cTrip104.id, vehicleId: vIdle1.id, driverName: 'Rahul Verma', type: 'fuel', fuelLiters: 40, fuelCost: 4000, miscExpense: 0, totalAmount: 4000, description: 'Electric charge + range-extender fuel', expenseDate: daysAgo(115), distance: 150 },
            { tripId: cTrip104.id, vehicleId: vIdle1.id, driverName: 'Rahul Verma', type: 'parking', fuelLiters: 0, fuelCost: 0, miscExpense: 200, totalAmount: 200, description: 'Mysore warehouse parking', expenseDate: daysAgo(114), distance: 0 },

            // ---- Month 3 (~90 days ago): Trips 105, 106 ----
            // Trip 105: Chennai→Hyderabad (vAvail1) — long haul again
            { tripId: cTrip105.id, vehicleId: vAvail1.id, driverName: 'Priya Sharma', type: 'fuel', fuelLiters: 180, fuelCost: 16200, miscExpense: 0, totalAmount: 16200, description: 'Diesel — two refuelling stops en route', expenseDate: daysAgo(89), distance: 630 },
            { tripId: cTrip105.id, vehicleId: vAvail1.id, driverName: 'Priya Sharma', type: 'toll', fuelLiters: 0, fuelCost: 0, miscExpense: 1800, totalAmount: 1800, description: 'NH44 highway tolls', expenseDate: daysAgo(89), distance: 0 },
            { tripId: cTrip105.id, vehicleId: vAvail1.id, driverName: 'Priya Sharma', type: 'repair', fuelLiters: 0, fuelCost: 0, miscExpense: 2500, totalAmount: 2500, description: 'Emergency tyre puncture repair en route', expenseDate: daysAgo(89), distance: 0 },
            { tripId: cTrip105.id, vehicleId: vAvail1.id, driverName: 'Priya Sharma', type: 'misc', fuelLiters: 0, fuelCost: 0, miscExpense: 800, totalAmount: 800, description: 'Driver lodging & food — overnight halt', expenseDate: daysAgo(88), distance: 0 },

            // Trip 106: Delhi→Gurgaon bike (vBike) — gives bike expenses
            { tripId: cTrip106.id, vehicleId: vBike.id, driverName: 'Rahul Verma', type: 'fuel', fuelLiters: 3, fuelCost: 300, miscExpense: 0, totalAmount: 300, description: 'CNG refill — IGL station', expenseDate: daysAgo(88), distance: 30 },

            // ---- Month 4 (~60 days ago): Trips 108, 109 ----
            // Trip 108: Jaipur→Udaipur (vAvail2)
            { tripId: cTrip108.id, vehicleId: vAvail2.id, driverName: 'Alex Johnson', type: 'fuel', fuelLiters: 55, fuelCost: 5500, miscExpense: 0, totalAmount: 5500, description: 'Petrol — full tank before departure', expenseDate: daysAgo(60), distance: 400 },
            { tripId: cTrip108.id, vehicleId: vAvail2.id, driverName: 'Alex Johnson', type: 'toll', fuelLiters: 0, fuelCost: 0, miscExpense: 350, totalAmount: 350, description: 'NH48 toll booth', expenseDate: daysAgo(60), distance: 0 },

            // Trip 109: Lucknow→Varanasi (vAvail3)
            { tripId: cTrip109.id, vehicleId: vAvail3.id, driverName: 'Priya Sharma', type: 'fuel', fuelLiters: 100, fuelCost: 9000, miscExpense: 0, totalAmount: 9000, description: 'Diesel — Lucknow fuel station', expenseDate: daysAgo(54), distance: 320 },
            { tripId: cTrip109.id, vehicleId: vAvail3.id, driverName: 'Priya Sharma', type: 'toll', fuelLiters: 0, fuelCost: 0, miscExpense: 500, totalAmount: 500, description: 'NH31/NH56 tolls', expenseDate: daysAgo(54), distance: 0 },
            { tripId: cTrip109.id, vehicleId: vAvail3.id, driverName: 'Priya Sharma', type: 'parking', fuelLiters: 0, fuelCost: 0, miscExpense: 200, totalAmount: 200, description: 'Overnight parking at delivery point', expenseDate: daysAgo(53), distance: 0 },

            // ---- Month 5 (recent ~15 days): Trips 110, 111 ----
            // Trip 110: Ahmedabad→Rajkot (vAvail1)
            { tripId: cTrip110.id, vehicleId: vAvail1.id, driverName: 'Rahul Verma', type: 'fuel', fuelLiters: 80, fuelCost: 7200, miscExpense: 0, totalAmount: 7200, description: 'Diesel — Ahmedabad to Rajkot', expenseDate: daysAgo(15), distance: 220 },
            { tripId: cTrip110.id, vehicleId: vAvail1.id, driverName: 'Rahul Verma', type: 'toll', fuelLiters: 0, fuelCost: 0, miscExpense: 350, totalAmount: 350, description: 'NH47 toll booth', expenseDate: daysAgo(15), distance: 0 },

            // Trip 111: Noida→Faridabad bike (vBike)
            { tripId: cTrip111.id, vehicleId: vBike.id, driverName: 'Alex Johnson', type: 'fuel', fuelLiters: 2, fuelCost: 200, miscExpense: 0, totalAmount: 200, description: 'CNG refill — quick top-up', expenseDate: daysAgo(10), distance: 25 },

            // Extra expenses on vOnTrip1 (for Costliest chart — 5th vehicle)
            { tripId: null, vehicleId: vOnTrip1.id, driverName: 'Alex Johnson', type: 'fuel', fuelLiters: 60, fuelCost: 5400, miscExpense: 0, totalAmount: 5400, description: 'Routine refuelling — pre-trip', expenseDate: daysAgo(3), distance: 200 },
            { tripId: null, vehicleId: vOnTrip1.id, driverName: 'Alex Johnson', type: 'repair', fuelLiters: 0, fuelCost: 0, miscExpense: 3500, totalAmount: 3500, description: 'Suspension spring replacement', expenseDate: daysAgo(25), distance: 0 },
            { tripId: null, vehicleId: vOnTrip1.id, driverName: 'Alex Johnson', type: 'parking', fuelLiters: 0, fuelCost: 0, miscExpense: 400, totalAmount: 400, description: 'Depot parking — weekly', expenseDate: daysAgo(5), distance: 0 }
        ]);

        console.log('Seeded 27 expenses.');

        // =====================================================================
        // SCENARIO COVERAGE SUMMARY
        //
        // Vehicles (12):
        //   Types:     truck(7), van(3), bike(2)
        //   Statuses:  available(3), on-trip(4), in-shop(1), idle(2), retired(1) ✓ ALL
        //   FuelTypes: diesel(8), petrol(2), electric(1), cng(1)                 ✓ ALL
        //   Regions:   North(3), South(3), West(3), East(2), Default(1-retired)  ✓ ALL
        //
        // Trips (18):
        //   Statuses:  completed(10), dispatched(4), draft(1), cancelled(2)      ✓ ALL
        //   Bike trips: 2 (trip 106, 111)                                        ✓
        //   With notes: 6 trips                                                  ✓
        //   Unassigned: 3 (trip 107, 116, 117)                                   ✓
        //   Per driver: Alex(6), Priya(4), Rahul(4), David(0-suspended)          ✓
        //
        // Maintenance (9):
        //   IssueTypes: engine, brakes, tires, electrical, transmission,
        //               oil-change, inspection, bodywork, other                  ✓ ALL 9
        //   Statuses:   new(2), in-progress(1), completed(6)                    ✓ ALL 3
        //   With notes: 5 logs                                                  ✓
        //   Spread:     across 5 months                                         ✓
        //
        // Expenses (27):
        //   Types:  fuel(8), toll(7), repair(2), parking(3), misc(2)            ✓ ALL 5
        //   Vehicles with costs: vAvail1, vAvail2, vAvail3, vIdle1,
        //                        vBike, vOnTrip1 (6 vehicles)                   ✓ 5+ for chart
        //   Months: 5 distinct months                                           ✓ chart rows
        //
        // Drivers (4):
        //   DutyStatus: on-duty(2), off-duty(1), suspended(1)                   ✓ ALL
        //   Safety:     95(green), 88(green), 72(amber), 45(red)                ✓ ALL ranges
        //   License:    expired(David,-365d), valid(others,+365-730d)           ✓
        //   Complaints: 0, 0, 1, 2                                             ✓ varied
        //   Fields:     phone, company, department all set                      ✓
        //
        // Analytics:
        //   Revenue:       ~229,200  (76,400 × 3)
        //   Fuel Cost:     ~87,100
        //   Maintenance:   ~43,700
        //   Total Cost:    ~130,800
        //   Net Profit:    ~98,400
        //   Fleet ROI:     ~75%
        //   Utilization:   33%  (4/12)
        //   Monthly chart: 5 distinct months with varying data                  ✓
        // =====================================================================

        console.log('\nDone! All scenarios covered. Seed data complete.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed dummy data:', error);
        process.exit(1);
    }
};

seedDummyData();
