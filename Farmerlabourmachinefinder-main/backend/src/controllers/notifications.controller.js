const Notification = require('../models/Notification.model');
const { formatDate } = require('../utils/format');

async function list(req, res) {
  const items = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.json({ notifications: items.map(serializeNotification) });
}

async function unreadCount(req, res) {
  const count = await Notification.countDocuments({ userId: req.user._id, read: false });
  return res.json({ count });
}

async function markRead(req, res) {
  const item = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  item.read = true;
  await item.save();
  return res.json({ notification: serializeNotification(item) });
}

function serializeNotification(n) {
  return {
    id: n._id,
    title: n.title,
    message: n.message,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt,
    createdAtFormatted: formatDate(n.createdAt)
  };
}

module.exports = { list, unreadCount, markRead };
