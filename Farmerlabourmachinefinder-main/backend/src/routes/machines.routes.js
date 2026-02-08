const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { listMachines, calendar, book } = require('../controllers/machines.controller');

const router = express.Router();

router.get('/', authMiddleware, listMachines);
router.get('/:id/calendar', authMiddleware, calendar);
router.post('/:id/book', authMiddleware, [body('date').notEmpty(), body('duration').notEmpty()], book);

module.exports = router;
