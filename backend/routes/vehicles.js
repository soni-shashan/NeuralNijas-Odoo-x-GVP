const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllVehicles, getVehicleById, createVehicle, updateVehicle, toggleStatus, deleteVehicle } = require('../controllers/vehicleController');

// All vehicle routes require authentication + admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.patch('/:id/toggle-status', toggleStatus);
router.delete('/:id', deleteVehicle);

module.exports = router;
