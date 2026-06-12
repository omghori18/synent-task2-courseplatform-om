require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/enroll', require('./routes/payment'));
app.use('/api/learn', require('./routes/learn'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Course Platform API running ✅' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// MongoDB + Server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });
