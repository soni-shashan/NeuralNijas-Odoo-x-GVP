const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllLogs, createLog, updateLogStatus, deleteLog, getServiceableVehicles } = require('../controllers/maintenanceController');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getAllLogs);
router.get('/vehicles', getServiceableVehicles);
router.post('/', createLog);
router.patch('/:id/status', updateLogStatus);
router.delete('/:id', deleteLog);

module.exports = router;
