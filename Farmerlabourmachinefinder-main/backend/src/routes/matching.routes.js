const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { getMatches } = require('../controllers/matching.controller');

const router = express.Router();

router.get('/:jobId', authMiddleware, getMatches);

module.exports = router;
