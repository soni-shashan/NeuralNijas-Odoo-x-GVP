const bcrypt = require('bcryptjs');
const { Vehicle, Trip, User } = require('../models');

const seedData = async () => {
    try {
        const demoAdminExists = await User.findOne({ where: { email: 'admin.manager@fleetflow.com' } });
        if (!demoAdminExists) {
            console.log('👤 Demo accounts not found. Seeding default Admin and Dispatcher accounts...');
            const adminPassword = await bcrypt.hash('admin123', 10);
            const dispatcherPassword = await bcrypt.hash('user123', 10);

            await User.bulkCreate([
                {
                    fullName: 'Admin Demo',
                    email: 'admin.manager@fleetflow.com',
                    password: adminPassword,
                    role: 'admin',
                    isVerified: true,
                    dutyStatus: 'on-duty',
                    safetyScore: 98
                },
                {
                    fullName: 'Dispatcher Demo',
                    email: 'dispatchers@fleetflow.com',
                    password: dispatcherPassword,
                    role: 'dispatcher',
                    isVerified: true,
                    dutyStatus: 'on-duty',
                    safetyScore: 85,
                    licenseNumber: 'GJ-12-DEMO-8899',
                    licenseExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
                }
            ]);
            console.log('✅ Demo accounts created successfully.');
        }

        console.log('🎉 Seed data complete!');
    } catch (error) {
        console.error('❌ Seed error:', error);
    }
};

module.exports = seedData;
