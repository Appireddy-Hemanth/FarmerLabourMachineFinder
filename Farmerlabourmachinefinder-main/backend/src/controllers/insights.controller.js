const Job = require('../models/Job.model');
const Payment = require('../models/Payment.model');

async function jobSummary(req, res) {
  const summary = await Job.aggregate([
    { $match: { farmerId: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  return res.json({ summary });
}

async function costTrends(req, res) {
  const trends = await Payment.aggregate([
    { $match: { farmerId: req.user._id } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: '$amountTotal' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
  return res.json({ trends });
}

module.exports = { jobSummary, costTrends };
