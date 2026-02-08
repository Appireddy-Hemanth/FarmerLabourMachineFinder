const { validationResult } = require('express-validator');
const Machine = require('../models/Machine.model');
const { formatInr, formatDate } = require('../utils/format');

function distanceKm(a, b) {
  if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDlat = Math.sin(dLat / 2);
  const sinDlng = Math.sin(dLng / 2);
  const c = 2 * Math.asin(Math.sqrt(sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng));
  return R * c;
}

async function listMachines(req, res) {
  const { radiusKm, lat, lng } = req.query;
  const all = await Machine.find({ availability: true });
  const origin = lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  const filtered = all.filter(m => {
    if (!radiusKm || !origin) return true;
    const dist = distanceKm(origin, m.geo);
    return dist == null ? false : dist <= Number(radiusKm);
  });
  return res.json({
    machines: filtered.map(m => ({
      id: m._id,
      machineType: m.machineType,
      description: m.description,
      price: m.price,
      priceFormatted: formatInr(m.price),
      priceUnit: m.priceUnit,
      deposit: m.deposit,
      depositFormatted: formatInr(m.deposit),
      location: m.location,
      availability: m.availability
    }))
  });
}

async function calendar(req, res) {
  const machine = await Machine.findById(req.params.id);
  if (!machine) {
    return res.status(404).json({ message: 'Machine not found' });
  }
  return res.json({
    machineId: machine._id,
    bookings: machine.bookings.map(b => ({
      date: b.date,
      dateFormatted: formatDate(b.date),
      duration: b.duration,
      status: b.status
    }))
  });
}

async function book(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  const machine = await Machine.findById(req.params.id);
  if (!machine) {
    return res.status(404).json({ message: 'Machine not found' });
  }
  const requestedDate = new Date(req.body.date);
  const hasBooking = machine.bookings.some(b => new Date(b.date).toDateString() === requestedDate.toDateString() && b.status !== 'CANCELLED');
  if (hasBooking) {
    return res.status(400).json({ message: 'Machine unavailable on selected date' });
  }
  machine.bookings.push({
    date: requestedDate,
    duration: req.body.duration,
    farmerId: req.user._id,
    status: 'CONFIRMED'
  });
  await machine.save();
  return res.status(201).json({ message: 'Booking confirmed' });
}

module.exports = { listMachines, calendar, book };
