const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },
    location: { type: String, required: true, trim: true },
    role: { type: String, enum: ['Farmer', 'Labour', 'Machine Owner', 'Admin'], required: true },
    passwordHash: { type: String, required: true },
    skills: { type: [String], default: [] },
    availability: { type: Boolean, default: true },
    geo: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
