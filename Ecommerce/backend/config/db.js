/*
  ╔══════════════════════════════════════════════════╗
  ║  backend/config/db.js                           ║
  ║  Connects the server to MongoDB Atlas           ║
  ╚══════════════════════════════════════════════════╝

  KEYWORDS:
  • mongoose.connect() → opens a connection to MongoDB
  • async/await        → handles operations that take time
                         async = this function is asynchronous
                         await = wait for this to finish
  • try/catch          → try the code, catch any errors
  • process.exit(1)    → stop the server if DB fails
*/

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() takes the MongoDB URL from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and stop server
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);  // 1 = exit with error
  }
};

// Export so server.js can call it with: require('./config/db')
module.exports = connectDB;