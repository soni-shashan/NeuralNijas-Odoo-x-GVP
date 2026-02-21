const { Vehicle } = require('../models');
const { Op } = require('sequelize');

// GET /api/vehicles - List all vehicles
const getAllVehicles = async (req, res) => {
    try {
        const { type, status, search, page = 1, limit = 15 } = req.query;
        const where = {};

        if (type) where.type = type;
        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { registrationNumber: { [Op.iLike]: `%${search}%` } },
                { make: { [Op.iLike]: `%${search}%` } },
                { model: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows: vehicles } = await Vehicle.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            vehicles,
            totalCount: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({ message: 'Failed to fetch vehicles.' });
    }
};

// GET /api/vehicles/:id
const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
        res.json({ vehicle });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch vehicle.' });
    }
};

// POST /api/vehicles - Create vehicle
const createVehicle = async (req, res) => {
    try {
        const { registrationNumber, type, make, model, year, maxLoadCapacity, mileage, region, fuelType } = req.body;

        const existing = await Vehicle.findOne({ where: { registrationNumber } });
        if (existing) return res.status(409).json({ message: 'Vehicle with this license plate already exists.' });

        const vehicle = await Vehicle.create({
            registrationNumber, type, make, model, year,
            maxLoadCapacity: maxLoadCapacity || 0,
            mileage: mileage || 0,
            region: region || 'Default',
            fuelType: fuelType || 'diesel',
            status: 'available'
        });

        res.status(201).json({ message: 'Vehicle registered successfully.', vehicle });
    } catch (error) {
        console.error('Create vehicle error:', error);
        res.status(500).json({ message: 'Failed to register vehicle.' });
    }
};

// PUT /api/vehicles/:id - Update vehicle
const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

        const { registrationNumber, type, make, model, year, maxLoadCapacity, mileage, region, fuelType, status } = req.body;

        // Check unique plate if changed
        if (registrationNumber && registrationNumber !== vehicle.registrationNumber) {
            const existing = await Vehicle.findOne({ where: { registrationNumber } });
            if (existing) return res.status(409).json({ message: 'License plate already in use.' });
        }

        await vehicle.update({
            registrationNumber: registrationNumber || vehicle.registrationNumber,
            type: type || vehicle.type,
            make: make || vehicle.make,
            model: model || vehicle.model,
            year: year !== undefined ? year : vehicle.year,
            maxLoadCapacity: maxLoadCapacity !== undefined ? maxLoadCapacity : vehicle.maxLoadCapacity,
            mileage: mileage !== undefined ? mileage : vehicle.mileage,
            region: region || vehicle.region,
            fuelType: fuelType || vehicle.fuelType,
            status: status || vehicle.status
        });

        res.json({ message: 'Vehicle updated.', vehicle });
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({ message: 'Failed to update vehicle.' });
    }
};

// PATCH /api/vehicles/:id/toggle-status - Toggle retired/available
const toggleStatus = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

        const newStatus = vehicle.status === 'retired' ? 'available' : 'retired';
        await vehicle.update({ status: newStatus });

        res.json({ message: `Vehicle ${newStatus === 'retired' ? 'retired' : 'reactivated'}.`, vehicle });
    } catch (error) {
        res.status(500).json({ message: 'Failed to toggle status.' });
    }
};

// DELETE /api/vehicles/:id
const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

        await vehicle.destroy();
        res.json({ message: 'Vehicle deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete vehicle.' });
    }
};

module.exports = { getAllVehicles, getVehicleById, createVehicle, updateVehicle, toggleStatus, deleteVehicle };
