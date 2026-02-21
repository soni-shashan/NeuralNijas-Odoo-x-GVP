const { MaintenanceLog, Vehicle } = require('../models');
const { Op } = require('sequelize');

// GET /api/maintenance — list all logs
const getAllLogs = async (req, res) => {
    try {
        const { status, issueType, search, page = 1, limit = 15 } = req.query;
        const where = {};

        if (status) where.status = status;
        if (issueType) where.issueType = issueType;

        if (search) {
            where[Op.or] = [
                { description: { [Op.iLike]: `%${search}%` } },
                { notes: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: logs } = await MaintenanceLog.findAndCountAll({
            where,
            include: [{
                model: Vehicle,
                as: 'vehicle',
                attributes: ['id', 'registrationNumber', 'type', 'make', 'model']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            logs,
            totalCount: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (error) {
        console.error('Get maintenance logs error:', error);
        res.status(500).json({ message: 'Failed to fetch maintenance logs.' });
    }
};

// POST /api/maintenance — create a log & auto-set vehicle to in-shop
const createLog = async (req, res) => {
    try {
        const { vehicleId, issueType, description, cost, serviceDate, notes } = req.body;

        const vehicle = await Vehicle.findByPk(vehicleId);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

        // Generate log number
        const lastLog = await MaintenanceLog.findOne({ order: [['logNumber', 'DESC']] });
        const logNumber = (lastLog?.logNumber || 0) + 1;

        const log = await MaintenanceLog.create({
            logNumber,
            vehicleId,
            issueType,
            description,
            cost: cost || 0,
            serviceDate: serviceDate || new Date(),
            notes,
            status: 'new'
        });

        // Auto-set vehicle to "in-shop"
        await vehicle.update({ status: 'in-shop' });

        res.status(201).json({
            message: `Service log created. ${vehicle.registrationNumber} is now "In Shop".`,
            log
        });
    } catch (error) {
        console.error('Create maintenance log error:', error);
        res.status(500).json({ message: 'Failed to create service log.' });
    }
};

// PATCH /api/maintenance/:id/status — update log status
const updateLogStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const log = await MaintenanceLog.findByPk(req.params.id, {
            include: [{ model: Vehicle, as: 'vehicle' }]
        });
        if (!log) return res.status(404).json({ message: 'Service log not found.' });

        const updates = { status };
        if (status === 'completed') {
            updates.completedDate = new Date();
            // Release vehicle back to available
            if (log.vehicle) {
                // Only release if no other open maintenance logs for this vehicle
                const openLogs = await MaintenanceLog.count({
                    where: {
                        vehicleId: log.vehicleId,
                        id: { [Op.ne]: log.id },
                        status: { [Op.ne]: 'completed' }
                    }
                });
                if (openLogs === 0) {
                    await log.vehicle.update({ status: 'available' });
                }
            }
        }

        await log.update(updates);
        res.json({ message: `Service log ${status}.`, log });
    } catch (error) {
        console.error('Update maintenance log error:', error);
        res.status(500).json({ message: 'Failed to update service log.' });
    }
};

// DELETE /api/maintenance/:id
const deleteLog = async (req, res) => {
    try {
        const log = await MaintenanceLog.findByPk(req.params.id, {
            include: [{ model: Vehicle, as: 'vehicle' }]
        });
        if (!log) return res.status(404).json({ message: 'Service log not found.' });

        const vehicleId = log.vehicleId;
        await log.destroy();

        // Release vehicle if no other open logs
        const openLogs = await MaintenanceLog.count({
            where: { vehicleId, status: { [Op.ne]: 'completed' } }
        });
        if (openLogs === 0) {
            await Vehicle.update({ status: 'available' }, { where: { id: vehicleId } });
        }

        res.json({ message: 'Service log deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete service log.' });
    }
};

// GET /api/maintenance/vehicles — vehicles not currently retired
const getServiceableVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll({
            where: { status: { [Op.ne]: 'retired' } },
            attributes: ['id', 'registrationNumber', 'type', 'make', 'model', 'status'],
            order: [['registrationNumber', 'ASC']]
        });
        res.json({ vehicles });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch vehicles.' });
    }
};

module.exports = { getAllLogs, createLog, updateLogStatus, deleteLog, getServiceableVehicles };
