const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { jobSummary, costTrends } = require('../controllers/insights.controller');

const router = express.Router();

router.get('/job-summary', authMiddleware, jobSummary);
router.get('/cost-trends', authMiddleware, costTrends);

module.exports = router;
