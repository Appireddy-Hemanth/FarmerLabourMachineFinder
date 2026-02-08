const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User.model');
const TokenBlacklist = require('../models/TokenBlacklist.model');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

function buildToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });
}

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  const { name, phone, location, role, password, skills, availability, geo } = req.body;
  const existing = await User.findOne({ phone });
  if (existing) {
    return res.status(409).json({ message: 'Phone already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    location,
    role,
    passwordHash,
    skills: skills || [],
    availability: availability !== undefined ? availability : true,
    geo: geo || {}
  });
  const token = buildToken(user);
  return res.status(201).json({
    token,
    user: { id: user._id, name: user.name, phone: user.phone, location: user.location, role: user.role }
  });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = buildToken(user);
  return res.json({
    token,
    user: { id: user._id, name: user.name, phone: user.phone, location: user.location, role: user.role }
  });
}

async function me(req, res) {
  return res.json({ user: req.user });
}

async function logout(req, res) {
  try {
    const decoded = jwt.verify(req.token, jwtSecret);
    const expiresAt = new Date(decoded.exp * 1000);
    await TokenBlacklist.create({ token: req.token, expiresAt });
  } catch (err) {
    // ignore token parsing issues on logout
  }
  return res.json({ message: 'Logged out' });
}

module.exports = { register, login, me, logout };
