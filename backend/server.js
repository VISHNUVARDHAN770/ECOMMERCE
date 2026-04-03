/*
  FILE: backend/server.js — FIXED FOR DEPLOYMENT
  
  KEY FIX: CORS now allows ALL origins
  This is needed because Vercel gives dynamic URLs
  that change on every deployment
*/

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');

dotenv.config();

const app = express();

// ── CORS FIX ────────────────────────────────────────
// Allow ALL origins — needed for Vercel deployment
// Vercel generates different URLs for each deployment
// so we cannot hardcode specific URLs
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    // Allow all vercel.app domains
    // Allow localhost for development
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight OPTIONS requests
// Browser sends OPTIONS request before actual request (CORS check)
app.options('*', cors());

// ── BODY PARSER ─────────────────────────────────────
app.use(express.json());

// ── CONNECT TO MONGODB ───────────────────────────────
const connectDB = require('./config/db');
connectDB();

// ── ROUTES ───────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');

// Log which routes are loading
console.log('authRoutes    type:', typeof authRoutes);
console.log('productRoutes type:', typeof productRoutes);
console.log('orderRoutes   type:', typeof orderRoutes);

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// ── TEST ROUTE ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '✅ EassyBuy Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// ── 404 HANDLER ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── START SERVER ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
});