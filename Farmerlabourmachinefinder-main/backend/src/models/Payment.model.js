const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
    amountBase: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    tax: { type: Number, required: true },
    amountTotal: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'ESCROW', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    transactionId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
