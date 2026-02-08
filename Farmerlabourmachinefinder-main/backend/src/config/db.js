const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  // eslint-disable-next-line no-console
  console.log('[db] connected');
}

module.exports = { connectDb };
