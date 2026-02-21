const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getOverview, getFuelEfficiency, getCostliestVehicles, getMonthlySummary, exportCSV } = require('../controllers/analyticsController');

router.use(authenticate);

router.get('/overview', getOverview);
router.get('/fuel-efficiency', getFuelEfficiency);
router.get('/costliest-vehicles', getCostliestVehicles);
router.get('/monthly-summary', getMonthlySummary);
router.get('/export-csv', exportCSV);

module.exports = router;
