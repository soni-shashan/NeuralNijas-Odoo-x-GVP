const { Vehicle, Trip, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// GET /api/dashboard/stats
const getStats = async (req, res) => {
    try {
        const totalVehicles = await Vehicle.count();
        const activeFleet = await Vehicle.count({ where: { status: 'on-trip' } });
        const maintenanceAlerts = await Vehicle.count({ where: { status: 'in-shop' } });
        const idleVehicles = await Vehicle.count({ where: { status: { [Op.in]: ['available', 'idle'] } } });
        const pendingCargo = await Trip.count({ where: { status: 'draft' } });

        const utilizationRate = totalVehicles > 0
            ? Math.round(((activeFleet) / totalVehicles) * 100)
            : 0;

        res.json({
            activeFleet,
            maintenanceAlerts,
            utilizationRate,
            pendingCargo,
            totalVehicles,
            idleVehicles
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
    }
};

// GET /api/dashboard/trips
const getTrips = async (req, res) => {
    try {
        const { type, status, region, search, page = 1, limit = 10 } = req.query;
        const where = {};
        const vehicleWhere = {};

        // Filters
        if (status) where.status = status;
        if (type) vehicleWhere.type = type;
        if (region) vehicleWhere.region = region;

        if (search) {
            where[Op.or] = [
                { driverName: { [Op.iLike]: `%${search}%` } },
                { origin: { [Op.iLike]: `%${search}%` } },
                { destination: { [Op.iLike]: `%${search}%` } },
                { cargo: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Role-based: dispatcher sees only their trips
        if (req.user.role === 'dispatcher') {
            where.driverId = req.user.id;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: trips } = await Trip.findAndCountAll({
            where,
            include: [{
                model: Vehicle,
                as: 'vehicle',
                attributes: ['registrationNumber', 'type', 'make', 'model', 'status'],
                where: Object.keys(vehicleWhere).length > 0 ? vehicleWhere : undefined,
                required: Object.keys(vehicleWhere).length > 0
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            trips,
            totalCount: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (error) {
        console.error('Dashboard trips error:', error);
        res.status(500).json({ message: 'Failed to fetch trips.' });
    }
};

// GET /api/dashboard/vehicles (quick list for dropdowns)
const getVehiclesSummary = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll({
            attributes: ['id', 'registrationNumber', 'type', 'status', 'region', 'make', 'model'],
            order: [['registrationNumber', 'ASC']]
        });
        res.json({ vehicles });
    } catch (error) {
        console.error('Vehicles summary error:', error);
        res.status(500).json({ message: 'Failed to fetch vehicles.' });
    }
};

module.exports = { getStats, getTrips, getVehiclesSummary };
