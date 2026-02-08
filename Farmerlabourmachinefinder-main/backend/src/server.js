const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDb } = require('./config/db');
const { port } = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const jobsRoutes = require('./routes/jobs.routes');
const matchingRoutes = require('./routes/matching.routes');
const machinesRoutes = require('./routes/machines.routes');
const paymentsRoutes = require('./routes/payments.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const insightsRoutes = require('./routes/insights.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/insights', insightsRoutes);

connectDb()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] running on ${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[server] failed to start', err);
    process.exit(1);
  });
