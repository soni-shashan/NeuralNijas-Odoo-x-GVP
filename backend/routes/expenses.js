const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getAllExpenses, getCostSummary, createExpense, deleteExpense, getCompletedTrips } = require('../controllers/expenseController');

router.use(authenticate);

router.get('/', getAllExpenses);
router.get('/cost-summary', getCostSummary);
router.get('/completed-trips', getCompletedTrips);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
