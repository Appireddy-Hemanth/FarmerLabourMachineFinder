const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { initiate, history, getPayment, updateStatus, invoice } = require('../controllers/payments.controller');

const router = express.Router();

router.post(
  '/initiate',
  authMiddleware,
  [body('amountBase').isNumeric(), body('platformFee').isNumeric(), body('tax').isNumeric()],
  initiate
);
router.get('/history', authMiddleware, history);
router.get('/:id', authMiddleware, getPayment);
router.put('/:id/status', authMiddleware, updateStatus);
router.get('/:id/invoice', authMiddleware, invoice);

module.exports = router;
