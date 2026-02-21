const { Expense, Vehicle, Trip, MaintenanceLog } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// GET /api/expenses — list all expenses
const getAllExpenses = async (req, res) => {
    try {
        const { type, search, page = 1, limit = 15 } = req.query;
        const where = {};

        if (type) where.type = type;
        if (search) {
            where[Op.or] = [
                { driverName: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Dispatcher sees only their expenses
        if (req.user.role === 'dispatcher') {
            // Find trips assigned to this user
            const driverTrips = await Trip.findAll({
                where: { driverId: req.user.id },
                attributes: ['id']
            });
            where.tripId = { [Op.in]: driverTrips.map(t => t.id) };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: expenses } = await Expense.findAndCountAll({
            where,
            include: [
                { model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'type', 'make', 'model'] },
                { model: Trip, as: 'trip', attributes: ['id', 'tripNumber', 'origin', 'destination', 'status'] }
            ],
            order: [['expenseDate', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            expenses,
            totalCount: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ message: 'Failed to fetch expenses.' });
    }
};

// GET /api/expenses/cost-summary — total operational cost per vehicle
const getCostSummary = async (req, res) => {
    try {
        // Fuel + misc expenses per vehicle
        const expenseTotals = await Expense.findAll({
            attributes: [
                'vehicleId',
                [sequelize.fn('SUM', sequelize.col('fuelCost')), 'totalFuelCost'],
                [sequelize.fn('SUM', sequelize.col('miscExpense')), 'totalMiscExpense'],
                [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalExpenses'],
                [sequelize.fn('SUM', sequelize.col('fuelLiters')), 'totalLiters'],
                [sequelize.fn('SUM', sequelize.col('distance')), 'totalDistance']
            ],
            include: [{ model: Vehicle, as: 'vehicle', attributes: ['registrationNumber', 'type', 'make', 'model'] }],
            group: ['vehicleId', 'vehicle.id'],
            raw: false
        });

        // Maintenance costs per vehicle
        const maintenanceTotals = await MaintenanceLog.findAll({
            attributes: [
                'vehicleId',
                [sequelize.fn('SUM', sequelize.col('cost')), 'totalMaintenanceCost']
            ],
            group: ['vehicleId'],
            raw: true
        });

        const maintenanceMap = {};
        maintenanceTotals.forEach(m => { maintenanceMap[m.vehicleId] = parseFloat(m.totalMaintenanceCost || 0); });

        const summary = expenseTotals.map(e => {
            const vehicleId = e.vehicleId;
            const maintenanceCost = maintenanceMap[vehicleId] || 0;
            const expenseCost = parseFloat(e.dataValues.totalExpenses || 0);
            return {
                vehicleId,
                vehicle: e.vehicle,
                totalFuelCost: parseFloat(e.dataValues.totalFuelCost || 0),
                totalMiscExpense: parseFloat(e.dataValues.totalMiscExpense || 0),
                totalExpenses: expenseCost,
                totalLiters: parseFloat(e.dataValues.totalLiters || 0),
                totalDistance: parseFloat(e.dataValues.totalDistance || 0),
                totalMaintenanceCost: maintenanceCost,
                totalOperationalCost: expenseCost + maintenanceCost
            };
        });

        res.json({ summary });
    } catch (error) {
        console.error('Cost summary error:', error);
        res.status(500).json({ message: 'Failed to fetch cost summary.' });
    }
};

// POST /api/expenses — create expense
const createExpense = async (req, res) => {
    try {
        const { tripId, vehicleId, driverName, type, fuelLiters, fuelCost, miscExpense, description, expenseDate, distance } = req.body;

        const vehicle = await Vehicle.findByPk(vehicleId);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

        const totalAmount = (parseFloat(fuelCost) || 0) + (parseFloat(miscExpense) || 0);

        const expense = await Expense.create({
            tripId: tripId || null,
            vehicleId,
            driverName,
            type,
            fuelLiters: fuelLiters || 0,
            fuelCost: fuelCost || 0,
            miscExpense: miscExpense || 0,
            totalAmount,
            description,
            expenseDate: expenseDate || new Date(),
            distance: distance || 0
        });

        res.status(201).json({ message: 'Expense recorded.', expense });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ message: 'Failed to record expense.' });
    }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found.' });
        await expense.destroy();
        res.json({ message: 'Expense deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete expense.' });
    }
};

// GET /api/expenses/completed-trips — completed trips for dropdown
const getCompletedTrips = async (req, res) => {
    try {
        const trips = await Trip.findAll({
            where: { status: 'completed' },
            include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'registrationNumber', 'make', 'model'] }],
            attributes: ['id', 'tripNumber', 'driverName', 'origin', 'destination', 'vehicleId'],
            order: [['tripNumber', 'DESC']]
        });
        res.json({ trips });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch trips.' });
    }
};

module.exports = { getAllExpenses, getCostSummary, createExpense, deleteExpense, getCompletedTrips };
