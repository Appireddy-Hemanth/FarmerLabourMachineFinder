const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createJob, myJobs, stats, updateStatus, repost } = require('../controllers/jobs.controller');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty(),
    body('workType').notEmpty(),
    body('category').notEmpty(),
    body('location').notEmpty(),
    body('date').notEmpty(),
    body('duration').notEmpty(),
    body('payment').isNumeric()
  ],
  createJob
);
router.get('/my', authMiddleware, myJobs);
router.get('/stats', authMiddleware, stats);
router.put('/:id/status', authMiddleware, updateStatus);
router.post('/:id/repost', authMiddleware, repost);

module.exports = router;
