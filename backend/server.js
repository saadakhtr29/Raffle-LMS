require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes Placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const ticketRoutes = require('./routes/ticket.routes');
const prizeRoutes = require('./routes/prize.routes');
const drawRoutes = require('./routes/draw.routes');
const winnerRoutes = require('./routes/winner.routes');

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/prizes', prizeRoutes);
app.use('/api/draw', drawRoutes);
app.use('/api/winners', winnerRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
