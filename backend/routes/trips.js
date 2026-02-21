const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getAllTrips, getAvailableResources, createTrip, updateTripStatus, deleteTrip } = require('../controllers/tripController');

router.use(authenticate);

router.get('/', getAllTrips);
router.get('/available-resources', getAvailableResources);
router.post('/', createTrip);
router.patch('/:id/status', updateTripStatus);
router.delete('/:id', deleteTrip);

module.exports = router;
