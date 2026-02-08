const { validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const Payment = require('../models/Payment.model');
const { formatInr, formatDate } = require('../utils/format');

const transitions = {
  PENDING: ['ESCROW', 'FAILED'],
  ESCROW: ['PAID', 'REFUNDED', 'FAILED'],
  PAID: [],
  FAILED: [],
  REFUNDED: []
};

function buildTransactionId() {
  return `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

async function initiate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  const { amountBase, platformFee, tax, jobId, requestId } = req.body;
  const amountTotal = Number(amountBase) + Number(platformFee) + Number(tax);
  const payment = await Payment.create({
    farmerId: req.user._id,
    jobId: jobId || null,
    requestId: requestId || null,
    amountBase,
    platformFee,
    tax,
    amountTotal,
    status: 'PENDING',
    transactionId: buildTransactionId()
  });
  return res.status(201).json({ payment: serializePayment(payment) });
}

async function history(req, res) {
  const payments = await Payment.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
  return res.json({ payments: payments.map(serializePayment) });
}

async function getPayment(req, res) {
  const payment = await Payment.findOne({ _id: req.params.id, farmerId: req.user._id });
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  return res.json({ payment: serializePayment(payment) });
}

async function updateStatus(req, res) {
  const payment = await Payment.findOne({ _id: req.params.id, farmerId: req.user._id });
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  const { status } = req.body;
  const allowed = transitions[payment.status] || [];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Invalid status transition ${payment.status} -> ${status}` });
  }
  payment.status = status;
  await payment.save();
  return res.json({ payment: serializePayment(payment) });
}

async function invoice(req, res) {
  const payment = await Payment.findOne({ _id: req.params.id, farmerId: req.user._id });
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${payment.transactionId}.pdf"`);
  doc.fontSize(18).text('AgriConnect Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Transaction ID: ${payment.transactionId}`);
  doc.text(`Date: ${formatDate(payment.createdAt)}`);
  doc.moveDown();
  doc.text(`Base Job Cost: ${formatInr(payment.amountBase)}`);
  doc.text(`Platform Fee: ${formatInr(payment.platformFee)}`);
  doc.text(`Tax: ${formatInr(payment.tax)}`);
  doc.text(`Total Paid: ${formatInr(payment.amountTotal)}`);
  doc.text(`Status: ${payment.status}`);
  doc.end();
  doc.pipe(res);
}

function serializePayment(payment) {
  return {
    id: payment._id,
    jobId: payment.jobId,
    requestId: payment.requestId,
    amountBase: payment.amountBase,
    platformFee: payment.platformFee,
    tax: payment.tax,
    amountTotal: payment.amountTotal,
    amountBaseFormatted: formatInr(payment.amountBase),
    platformFeeFormatted: formatInr(payment.platformFee),
    taxFormatted: formatInr(payment.tax),
    amountTotalFormatted: formatInr(payment.amountTotal),
    status: payment.status,
    transactionId: payment.transactionId,
    createdAt: payment.createdAt,
    createdAtFormatted: formatDate(payment.createdAt)
  };
}

module.exports = { initiate, history, getPayment, updateStatus, invoice };
