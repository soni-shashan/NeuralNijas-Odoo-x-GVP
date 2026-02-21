const { User, Trip, Vehicle } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// GET /api/drivers — list all drivers with performance stats
const getAllDrivers = async (req, res) => {
    try {
        const { search, dutyStatus, page = 1, limit = 15 } = req.query;
        const where = { role: 'dispatcher' };

        if (dutyStatus) where.dutyStatus = dutyStatus;
        if (search) {
            where[Op.or] = [
                { fullName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { licenseNumber: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: drivers } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password', 'otp', 'otpExpiry'] },
            order: [['fullName', 'ASC']],
            limit: parseInt(limit),
            offset
        });

        // Enrich with trip stats
        const enriched = await Promise.all(drivers.map(async (driver) => {
            const totalTrips = await Trip.count({ where: { driverId: driver.id } });
            const completedTrips = await Trip.count({ where: { driverId: driver.id, status: 'completed' } });
            const cancelledTrips = await Trip.count({ where: { driverId: driver.id, status: 'cancelled' } });
            const completionRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;

            const isLicenseExpired = driver.licenseExpiry ? new Date(driver.licenseExpiry) < new Date() : false;

            return {
                ...driver.toJSON(),
                totalTrips,
                completedTrips,
                cancelledTrips,
                completionRate,
                isLicenseExpired
            };
        }));

        res.json({
            drivers: enriched,
            totalCount: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({ message: 'Failed to fetch drivers.' });
    }
};

// PATCH /api/drivers/:id/duty-status — toggle duty status
const updateDutyStatus = async (req, res) => {
    try {
        const { dutyStatus } = req.body;
        const driver = await User.findByPk(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found.' });

        await driver.update({ dutyStatus });
        res.json({ message: `Driver set to ${dutyStatus}.`, driver: { id: driver.id, dutyStatus } });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update duty status.' });
    }
};

// PATCH /api/drivers/:id/profile — update license & safety info
const updateDriverProfile = async (req, res) => {
    try {
        const driver = await User.findByPk(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found.' });

        const { licenseNumber, licenseExpiry, safetyScore, complaints } = req.body;

        await driver.update({
            licenseNumber: licenseNumber !== undefined ? licenseNumber : driver.licenseNumber,
            licenseExpiry: licenseExpiry !== undefined ? licenseExpiry : driver.licenseExpiry,
            safetyScore: safetyScore !== undefined ? safetyScore : driver.safetyScore,
            complaints: complaints !== undefined ? complaints : driver.complaints
        });

        res.json({ message: 'Driver profile updated.', driver: { id: driver.id, licenseNumber: driver.licenseNumber, licenseExpiry: driver.licenseExpiry, safetyScore: driver.safetyScore, complaints: driver.complaints } });
    } catch (error) {
        console.error('Update driver profile error:', error);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
};

module.exports = { getAllDrivers, updateDutyStatus, updateDriverProfile };
