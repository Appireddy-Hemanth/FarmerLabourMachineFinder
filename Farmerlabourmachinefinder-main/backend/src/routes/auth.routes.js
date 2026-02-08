const express = require('express');
const { body } = require('express-validator');
const { register, login, me, logout } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('phone').notEmpty(),
    body('location').notEmpty(),
    body('role').isIn(['Farmer', 'Labour', 'Machine Owner', 'Admin']),
    body('password').isLength({ min: 6 })
  ],
  register
);

router.post('/login', [body('phone').notEmpty(), body('password').notEmpty()], login);
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);

module.exports = router;
