/*
  ╔══════════════════════════════════════════════════╗
  ║  backend/server.js                              ║
  ║  THE ENTRY POINT — first file you run           ║
  ║                                                  ║
  ║  What it does:                                  ║
  ║  1. Loads all packages (express, cors, dotenv)  ║
  ║  2. Connects to MongoDB                         ║
  ║  3. Registers all routes (/api/auth, etc.)      ║
  ║  4. Starts listening on PORT 5000               ║
  ║                                                  ║
  ║  To run: node server.js                         ║
  ╚══════════════════════════════════════════════════╝

  KEYWORDS:
  • require()     → loads a package or file (like import)
  • express()     → creates the web application
  • app.use()     → applies a middleware or route to the app
  • app.listen()  → starts the server on a port
  • process.env   → reads values from the .env file
  • cors          → allows frontend (port 5500) to talk to
                    backend (port 5000) — different ports
                    need CORS permission
  • express.json()→ lets server read JSON data from requests
*/

// ── STEP 1: Load packages ──────────────────────────
const express = require('express');   // web framework
const mongoose = require('mongoose'); // MongoDB connection
const cors = require('cors');         // allow cross-origin requests
const dotenv = require('dotenv');     // read .env file

// ── STEP 2: Load .env variables ────────────────────
// This makes process.env.PORT, process.env.MONGO_URI
// etc. available throughout the app
dotenv.config();

// ── STEP 3: Create the Express app ─────────────────
const app = express();

// ── STEP 4: Apply global middlewares ───────────────

// cors() — allows your frontend (localhost:5500) to
// send requests to this backend (localhost:5000)
// Without this, browser blocks all API calls
app.use(cors({
  origin: 'https://ecommerce-wine-theta-16.vercel.app/',   // allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// express.json() — parses incoming JSON request bodies
// Without this, req.body will be undefined
app.use(express.json());

// ── STEP 5: Connect to MongoDB ─────────────────────
const connectDB = require('./config/db');
connectDB();

// ── STEP 6: Load and register all routes ───────────
// Each route file handles a group of URLs:
// authRoutes    → /api/auth/register, /api/auth/login
// productRoutes → /api/products
// orderRoutes   → /api/orders

const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');

// app.use(path, router) — mounts the routes at a base path
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// ── STEP 7: Test route ─────────────────────────────
// Visit http://localhost:5000 to confirm server works
app.get('/', (req, res) => {
  res.json({
    message: '✅ EassyBuy Backend is running!',
    version: '1.0.0'
  });
});

// ── STEP 8: Handle unknown routes ──────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── STEP 9: Start the server ───────────────────────
// process.env.PORT reads PORT=5000 from your .env file
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║  ✅ Server running on port ${PORT}     ║
  ║  📡 API: http://localhost:${PORT}      ║
  ╚══════════════════════════════════════╝
  `);
});