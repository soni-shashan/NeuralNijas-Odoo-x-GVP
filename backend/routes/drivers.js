const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllDrivers, updateDutyStatus, updateDriverProfile } = require('../controllers/driverController');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getAllDrivers);
router.patch('/:id/duty-status', updateDutyStatus);
router.patch('/:id/profile', updateDriverProfile);

module.exports = router;
