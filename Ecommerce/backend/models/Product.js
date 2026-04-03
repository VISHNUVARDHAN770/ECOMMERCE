/*
  ╔══════════════════════════════════════════════════╗
  ║  backend/models/Product.js                      ║
  ║  Defines the shape of product data in MongoDB   ║
  ╚══════════════════════════════════════════════════╝
*/

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },

    emoji: {
      type: String,
      default: '📦'   // default emoji if none given
    },

    image: {
      type: String,
      default: ''     // path like 'assets/products/headphones.jpg'
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },

    origPrice: {
      type: Number,
      default: 0
    },

    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },

    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5
    },

    desc: {
      type: String,
      default: ''
    },

    tags: {
      type: [String],  // array of strings
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;