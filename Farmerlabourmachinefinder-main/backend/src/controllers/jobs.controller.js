const { validationResult } = require('express-validator');
const Job = require('../models/Job.model');
const { formatDate, formatInr } = require('../utils/format');

const transitions = {
  OPEN: ['NEGOTIATION'],
  NEGOTIATION: ['ASSIGNED'],
  ASSIGNED: ['COMPLETED'],
  COMPLETED: []
};

async function createJob(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  const job = await Job.create({
    farmerId: req.user._id,
    title: req.body.title,
    workType: req.body.workType,
    category: req.body.category,
    location: req.body.location,
    date: req.body.date,
    duration: req.body.duration,
    payment: req.body.payment,
    description: req.body.description || '',
    toolsProvidedBy: req.body.toolsProvidedBy,
    toolsRequired: req.body.toolsRequired || [],
    expiryAt: req.body.expiryAt || null
  });
  return res.status(201).json({ job: serializeJob(job) });
}

async function myJobs(req, res) {
  const jobs = await Job.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
  return res.json({ jobs: jobs.map(serializeJob) });
}

async function stats(req, res) {
  const jobs = await Job.find({ farmerId: req.user._id });
  const counts = {
    OPEN: jobs.filter(j => j.status === 'OPEN').length,
    NEGOTIATION: jobs.filter(j => j.status === 'NEGOTIATION').length,
    ASSIGNED: jobs.filter(j => j.status === 'ASSIGNED').length,
    COMPLETED: jobs.filter(j => j.status === 'COMPLETED').length
  };
  return res.json({ counts });
}

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const job = await Job.findOne({ _id: id, farmerId: req.user._id });
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  const allowed = transitions[job.status] || [];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Invalid status transition ${job.status} -> ${status}` });
  }
  job.status = status;
  await job.save();
  return res.json({ job: serializeJob(job) });
}

async function repost(req, res) {
  const { id } = req.params;
  const original = await Job.findOne({ _id: id, farmerId: req.user._id });
  if (!original) {
    return res.status(404).json({ message: 'Job not found' });
  }
  const job = await Job.create({
    farmerId: req.user._id,
    title: original.title,
    workType: original.workType,
    category: original.category,
    location: original.location,
    date: new Date(),
    duration: original.duration,
    payment: original.payment,
    description: original.description,
    toolsProvidedBy: original.toolsProvidedBy,
    toolsRequired: original.toolsRequired,
    expiryAt: original.expiryAt
  });
  return res.status(201).json({ job: serializeJob(job) });
}

function serializeJob(job) {
  return {
    id: job._id,
    title: job.title,
    workType: job.workType,
    category: job.category,
    location: job.location,
    date: job.date,
    dateFormatted: formatDate(job.date),
    duration: job.duration,
    payment: job.payment,
    paymentFormatted: formatInr(job.payment),
    status: job.status,
    description: job.description,
    toolsProvidedBy: job.toolsProvidedBy,
    toolsRequired: job.toolsRequired,
    expiryAt: job.expiryAt,
    expiryFormatted: job.expiryAt ? formatDate(job.expiryAt) : null,
    createdAt: job.createdAt
  };
}

module.exports = { createJob, myJobs, stats, updateStatus, repost };
