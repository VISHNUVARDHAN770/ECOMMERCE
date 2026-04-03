/*
  ╔══════════════════════════════════════════════════╗
  ║  backend/models/User.js                         ║
  ║  Defines the shape of user data in MongoDB      ║
  ╚══════════════════════════════════════════════════╝

  KEYWORDS:
  • Schema      → blueprint/template for data structure
  • mongoose.model() → creates a Model from the Schema
                       Model = a class that talks to the DB
  • required    → field must be provided, else error
  • unique      → no two documents can have same value
  • trim        → removes spaces from start and end
  • lowercase   → stores email in lowercase always
  • enum        → value must be one of these options
  • timestamps  → auto adds createdAt and updatedAt fields
*/

const mongoose = require('mongoose');

// Define what a User document looks like in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,       // data type = text
      required: [true, 'Name is required'],
      trim: true          // removes extra spaces
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,       // no duplicate emails
      lowercase: true,    // always store as lowercase
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },

    role: {
      type: String,
      enum: ['user', 'admin'],  // only these 2 values allowed
      default: 'user'           // new users are 'user' by default
    }
  },
  {
    timestamps: true  // auto-adds createdAt and updatedAt
  }
);

// Create the Model from the Schema
// 'User' → MongoDB will create a collection called 'users'
const User = mongoose.model('User', userSchema);

module.exports = User;