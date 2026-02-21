const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getStats, getTrips, getVehiclesSummary } = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(authenticate);

router.get('/stats', getStats);
router.get('/trips', getTrips);
router.get('/vehicles', getVehiclesSummary);

module.exports = router;
