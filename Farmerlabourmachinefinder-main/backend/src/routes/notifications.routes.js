const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { list, unreadCount, markRead } = require('../controllers/notifications.controller');

const router = express.Router();

router.get('/', authMiddleware, list);
router.get('/unread-count', authMiddleware, unreadCount);
router.put('/:id/read', authMiddleware, markRead);

module.exports = router;
