const { Vehicle, Trip, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/trips — list trips with filters
const getAllTrips = async (req, res) => {
    try {
        const { status, type, search, page = 1, limit = 15 } = req.query;
        const where = {};
        const vehicleWhere = {};

        if (status) where.status = status;
        if (type) vehicleWhere.type = type;

        if (search) {
            where[Op.or] = [
                { driverName: { [Op.iLike]: `%${search}%` } },
                { origin: { [Op.iLike]: `%${search}%` } },
                { destination: { [Op.iLike]: `%${search}%` } },
                { cargo: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Dispatcher sees only their trips
        if (req.user.role === 'dispatcher') {
            where.driverId = req.user.id;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: trips } = await Trip.findAndCountAll({
            where,
            include: [{
                model: Vehicle,
                as: 'vehicle',
                attributes: ['id', 'registrationNumber', 'type', 'make', 'model', 'maxLoadCapacity', 'status'],
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
        console.error('Get trips error:', error);
        res.status(500).json({ message: 'Failed to fetch trips.' });
    }
};

// GET /api/trips/available-resources — available vehicles & drivers for trip creation
const getAvailableResources = async (req, res) => {
    try {
        // Find drivers currently on active trips
        const activeTrips = await Trip.findAll({
            where: { status: { [Op.in]: ['draft', 'dispatched'] }, driverId: { [Op.not]: null } },
            attributes: ['driverId']
        });
        const busyDriverIds = activeTrips.map(t => t.driverId);

        const vehicles = await Vehicle.findAll({
            where: { status: 'available' },
            attributes: ['id', 'registrationNumber', 'type', 'make', 'model', 'maxLoadCapacity'],
            order: [['registrationNumber', 'ASC']]
        });

        const drivers = await User.findAll({
            where: {
                role: 'dispatcher',
                isVerified: true,
                dutyStatus: 'on-duty',
                id: { [Op.notIn]: busyDriverIds.length ? busyDriverIds : [] },
                [Op.or]: [
                    { licenseExpiry: null },
                    { licenseExpiry: { [Op.gte]: new Date() } }
                ]
            },
            attributes: ['id', 'fullName', 'email', 'licenseNumber', 'licenseExpiry'],
            order: [['fullName', 'ASC']]
        });

        res.json({ vehicles, drivers });
    } catch (error) {
        console.error('Available resources error:', error);
        res.status(500).json({ message: 'Failed to fetch available resources.' });
    }
};

// POST /api/trips — create a trip
const createTrip = async (req, res) => {
    try {
        const { vehicleId, driverId, origin, destination, cargo, cargoWeight, estimatedFuelCost, notes } = req.body;

        // Validate vehicle capacity
        if (vehicleId && cargoWeight) {
            const vehicle = await Vehicle.findByPk(vehicleId);
            if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });

            if (vehicle.status !== 'available') {
                return res.status(400).json({ message: `Vehicle ${vehicle.registrationNumber} is not available (currently ${vehicle.status}).` });
            }

            // Convert cargoWeight (kg) to tons for comparison
            const cargoInTons = cargoWeight / 1000;
            if (vehicle.maxLoadCapacity > 0 && cargoInTons > vehicle.maxLoadCapacity) {
                return res.status(400).json({
                    message: `Cargo weight (${cargoWeight} kg / ${cargoInTons.toFixed(1)} tons) exceeds vehicle max capacity (${vehicle.maxLoadCapacity} tons). Too heavy!`
                });
            }
        }

        // Get driver name + check license
        let driverName = null;
        if (driverId) {
            const driver = await User.findByPk(driverId);
            if (driver) {
                driverName = driver.fullName;
                if (driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date()) {
                    return res.status(400).json({ message: `Driver ${driver.fullName}'s license expired on ${driver.licenseExpiry}. Cannot assign to trip.` });
                }
                if (driver.dutyStatus === 'suspended') {
                    return res.status(400).json({ message: `Driver ${driver.fullName} is suspended. Cannot assign to trip.` });
                }
            }
        }

        // Generate trip number
        const lastTrip = await Trip.findOne({ order: [['tripNumber', 'DESC']] });
        const tripNumber = (lastTrip?.tripNumber || 0) + 1;

        const trip = await Trip.create({
            tripNumber,
            vehicleId: vehicleId || null,
            driverId: driverId || null,
            driverName,
            origin, destination, cargo,
            cargoWeight: cargoWeight || 0,
            estimatedFuelCost: estimatedFuelCost || 0,
            notes,
            status: 'draft'
        });

        // Mark vehicle as on-trip if assigned
        if (vehicleId) {
            await Vehicle.update({ status: 'on-trip' }, { where: { id: vehicleId } });
        }

        res.status(201).json({ message: 'Trip created successfully.', trip });
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({ message: 'Failed to create trip.' });
    }
};

// PATCH /api/trips/:id/status — update trip lifecycle
const updateTripStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validTransitions = {
            draft: ['dispatched', 'cancelled'],
            dispatched: ['completed', 'cancelled'],
            completed: [],
            cancelled: []
        };

        const trip = await Trip.findByPk(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found.' });

        if (!validTransitions[trip.status]?.includes(status)) {
            return res.status(400).json({ message: `Cannot change status from "${trip.status}" to "${status}".` });
        }

        const updates = { status };
        if (status === 'dispatched') updates.startDate = new Date();
        if (status === 'completed') updates.endDate = new Date();

        // Release vehicle if completed or cancelled
        if ((status === 'completed' || status === 'cancelled') && trip.vehicleId) {
            await Vehicle.update({ status: 'available' }, { where: { id: trip.vehicleId } });
        }

        await trip.update(updates);

        res.json({ message: `Trip ${status}.`, trip });
    } catch (error) {
        console.error('Update trip status error:', error);
        res.status(500).json({ message: 'Failed to update trip status.' });
    }
};

// DELETE /api/trips/:id — only drafts
const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findByPk(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found.' });

        if (trip.status !== 'draft') {
            return res.status(400).json({ message: 'Only draft trips can be deleted.' });
        }

        // Release vehicle
        if (trip.vehicleId) {
            await Vehicle.update({ status: 'available' }, { where: { id: trip.vehicleId } });
        }

        await trip.destroy();
        res.json({ message: 'Trip deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete trip.' });
    }
};

module.exports = { getAllTrips, getAvailableResources, createTrip, updateTripStatus, deleteTrip };
