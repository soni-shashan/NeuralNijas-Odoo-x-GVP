const { Vehicle, Trip, Expense, MaintenanceLog } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// GET /api/analytics/overview — KPI cards
const getOverview = async (req, res) => {
    try {
        // Total fuel cost
        const fuelResult = await Expense.findOne({
            attributes: [[sequelize.fn('SUM', sequelize.col('fuelCost')), 'totalFuel']],
            raw: true
        });
        const totalFuelCost = parseFloat(fuelResult?.totalFuel || 0);

        // Total maintenance cost
        const maintResult = await MaintenanceLog.findOne({
            attributes: [[sequelize.fn('SUM', sequelize.col('cost')), 'totalMaint']],
            raw: true
        });
        const totalMaintenanceCost = parseFloat(maintResult?.totalMaint || 0);

        // Total expenses (all)
        const expResult = await Expense.findOne({
            attributes: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalExp']],
            raw: true
        });
        const totalExpenses = parseFloat(expResult?.totalExp || 0);

        // Utilization
        const totalVehicles = await Vehicle.count();
        const activeVehicles = await Vehicle.count({ where: { status: 'on-trip' } });
        const utilizationRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

        // Completed trips
        const completedTrips = await Trip.count({ where: { status: 'completed' } });
        const totalTrips = await Trip.count();

        // Estimated revenue (sum of estimatedFuelCost * 3 as rough revenue proxy — or just use trip count * avg rate)
        const revenueResult = await Trip.findOne({
            where: { status: 'completed' },
            attributes: [[sequelize.fn('SUM', sequelize.col('estimatedFuelCost')), 'totalRevenue']],
            raw: true
        });
        const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0) * 3; // rough multiplier

        const totalCost = totalFuelCost + totalMaintenanceCost;
        const netProfit = totalRevenue - totalCost;
        const fleetROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost * 100).toFixed(1) : 0;

        res.json({
            totalFuelCost,
            totalMaintenanceCost,
            totalExpenses,
            totalRevenue,
            netProfit,
            fleetROI,
            utilizationRate,
            completedTrips,
            totalTrips,
            totalVehicles
        });
    } catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics.' });
    }
};

// GET /api/analytics/fuel-efficiency — km/L per vehicle
const getFuelEfficiency = async (req, res) => {
    try {
        const data = await Expense.findAll({
            where: { type: 'fuel', fuelLiters: { [Op.gt]: 0 } },
            attributes: [
                'vehicleId',
                [sequelize.fn('SUM', sequelize.col('distance')), 'totalKm'],
                [sequelize.fn('SUM', sequelize.col('fuelLiters')), 'totalLiters'],
                [sequelize.fn('SUM', sequelize.col('fuelCost')), 'totalFuelCost']
            ],
            include: [{ model: Vehicle, as: 'vehicle', attributes: ['registrationNumber', 'type', 'make', 'model'] }],
            group: ['vehicleId', 'vehicle.id'],
            raw: false
        });

        const efficiency = data.map(e => {
            const km = parseFloat(e.dataValues.totalKm || 0);
            const liters = parseFloat(e.dataValues.totalLiters || 0);
            return {
                vehicleId: e.vehicleId,
                vehicle: e.vehicle,
                totalKm: km,
                totalLiters: liters,
                totalFuelCost: parseFloat(e.dataValues.totalFuelCost || 0),
                kmPerLiter: liters > 0 ? (km / liters).toFixed(2) : 0
            };
        }).sort((a, b) => b.kmPerLiter - a.kmPerLiter);

        res.json({ efficiency });
    } catch (error) {
        console.error('Fuel efficiency error:', error);
        res.status(500).json({ message: 'Failed to fetch fuel efficiency.' });
    }
};

// GET /api/analytics/costliest-vehicles — top 5 costliest
const getCostliestVehicles = async (req, res) => {
    try {
        // Expense costs per vehicle
        const expenseCosts = await Expense.findAll({
            attributes: [
                'vehicleId',
                [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalExpenses']
            ],
            include: [{ model: Vehicle, as: 'vehicle', attributes: ['registrationNumber', 'type', 'make', 'model'] }],
            group: ['vehicleId', 'vehicle.id'],
            raw: false
        });

        const maintCosts = await MaintenanceLog.findAll({
            attributes: [
                'vehicleId',
                [sequelize.fn('SUM', sequelize.col('cost')), 'totalMaintenance']
            ],
            group: ['vehicleId'],
            raw: true
        });

        const maintMap = {};
        maintCosts.forEach(m => { maintMap[m.vehicleId] = parseFloat(m.totalMaintenance || 0); });

        const costliest = expenseCosts.map(e => ({
            vehicleId: e.vehicleId,
            vehicle: e.vehicle,
            totalExpenses: parseFloat(e.dataValues.totalExpenses || 0),
            totalMaintenance: maintMap[e.vehicleId] || 0,
            totalCost: parseFloat(e.dataValues.totalExpenses || 0) + (maintMap[e.vehicleId] || 0)
        })).sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);

        res.json({ costliest });
    } catch (error) {
        console.error('Costliest vehicles error:', error);
        res.status(500).json({ message: 'Failed to fetch costliest vehicles.' });
    }
};

// GET /api/analytics/monthly-summary — monthly financial breakdown
const getMonthlySummary = async (req, res) => {
    try {
        // Get all expenses with dates
        const expenses = await Expense.findAll({
            attributes: ['expenseDate', 'fuelCost', 'miscExpense', 'totalAmount'],
            order: [['expenseDate', 'ASC']],
            raw: true
        });

        const maintenance = await MaintenanceLog.findAll({
            attributes: ['serviceDate', 'cost'],
            order: [['serviceDate', 'ASC']],
            raw: true
        });

        const trips = await Trip.findAll({
            where: { status: 'completed' },
            attributes: ['endDate', 'estimatedFuelCost'],
            order: [['endDate', 'ASC']],
            raw: true
        });

        // Aggregate by month
        const months = {};

        expenses.forEach(e => {
            const key = e.expenseDate ? e.expenseDate.substring(0, 7) : 'Unknown';
            if (!months[key]) months[key] = { month: key, revenue: 0, fuelCost: 0, maintenance: 0 };
            months[key].fuelCost += parseFloat(e.fuelCost || 0);
        });

        maintenance.forEach(m => {
            const key = m.serviceDate ? m.serviceDate.substring(0, 7) : 'Unknown';
            if (!months[key]) months[key] = { month: key, revenue: 0, fuelCost: 0, maintenance: 0 };
            months[key].maintenance += parseFloat(m.cost || 0);
        });

        trips.forEach(t => {
            const d = t.endDate ? new Date(t.endDate).toISOString().substring(0, 7) : 'Unknown';
            if (!months[d]) months[d] = { month: d, revenue: 0, fuelCost: 0, maintenance: 0 };
            months[d].revenue += parseFloat(t.estimatedFuelCost || 0) * 3;
        });

        const summary = Object.values(months).map(m => ({
            ...m,
            netProfit: m.revenue - m.fuelCost - m.maintenance
        })).sort((a, b) => a.month.localeCompare(b.month));

        res.json({ summary });
    } catch (error) {
        console.error('Monthly summary error:', error);
        res.status(500).json({ message: 'Failed to fetch monthly summary.' });
    }
};

// GET /api/analytics/export-csv — export data as CSV
const exportCSV = async (req, res) => {
    try {
        const { type = 'expenses' } = req.query;
        let csvContent = '';

        if (type === 'expenses') {
            const expenses = await Expense.findAll({
                include: [{ model: Vehicle, as: 'vehicle', attributes: ['registrationNumber'] }],
                order: [['expenseDate', 'DESC']],
                raw: true,
                nest: true
            });
            csvContent = 'Date,Vehicle,Type,Fuel Liters,Fuel Cost,Misc Expense,Total,Distance\n';
            expenses.forEach(e => {
                const date = e.expenseDate ? new Date(e.expenseDate).toISOString().split('T')[0] : '';
                csvContent += `${date},${e.vehicle?.registrationNumber || ''},${e.type},${e.fuelLiters},${e.fuelCost},${e.miscExpense},${e.totalAmount},${e.distance}\n`;
            });
        } else if (type === 'maintenance') {
            const logs = await MaintenanceLog.findAll({
                include: [{ model: Vehicle, as: 'vehicle', attributes: ['registrationNumber'] }],
                order: [['serviceDate', 'DESC']],
                raw: true,
                nest: true
            });
            csvContent = 'Date,Vehicle,Issue Type,Description,Cost,Status\n';
            logs.forEach(l => {
                const date = l.serviceDate ? new Date(l.serviceDate).toISOString().split('T')[0] : '';
                csvContent += `${date},${l.vehicle?.registrationNumber || ''},${l.issueType},"${(l.description || '').replace(/"/g, '""')}",${l.cost},${l.status}\n`;
            });
        } else if (type === 'trips') {
            const trips = await Trip.findAll({
                include: [{ model: Vehicle, as: 'vehicle', attributes: ['registrationNumber'] }],
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true
            });
            csvContent = 'Trip#,Vehicle,Driver,Origin,Destination,Cargo,Weight(kg),Status,Start,End\n';
            trips.forEach(t => {
                const start = t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '';
                const end = t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : '';
                csvContent += `${t.tripNumber},${t.vehicle?.registrationNumber || ''},${t.driverName || ''},${t.origin},${t.destination},${t.cargo || ''},${t.cargoWeight},${t.status},${start},${end}\n`;
            });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=fleetflow_${type}_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvContent);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ message: 'Failed to export.' });
    }
};

module.exports = { getOverview, getFuelEfficiency, getCostliestVehicles, getMonthlySummary, exportCSV };
