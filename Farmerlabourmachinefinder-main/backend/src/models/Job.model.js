const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    workType: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    duration: { type: String, required: true, trim: true },
    payment: { type: Number, required: true },
    status: { type: String, enum: ['OPEN', 'NEGOTIATION', 'ASSIGNED', 'COMPLETED'], default: 'OPEN' },
    description: { type: String, default: '' },
    toolsProvidedBy: { type: String, enum: ['Labour', 'Farmer', 'Machine Owner'], default: 'Labour' },
    toolsRequired: { type: [String], default: [] },
    expiryAt: { type: Date },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
