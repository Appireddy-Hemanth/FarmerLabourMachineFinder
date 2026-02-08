const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    duration: { type: String, required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' }
  },
  { _id: false }
);

const MachineSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    machineType: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    priceUnit: { type: String, default: 'day' },
    deposit: { type: Number, default: 0 },
    location: { type: String, required: true, trim: true },
    geo: {
      lat: { type: Number },
      lng: { type: Number }
    },
    availability: { type: Boolean, default: true },
    bookings: { type: [BookingSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Machine', MachineSchema);
