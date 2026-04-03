/*
  FILE: backend/controllers/orderController.js — FIXED

  BUG: Stock was never reduced when order was placed
  After buying MacBook (stock=10) → still showed 10
  
  FIX: After saving the order, loop through each item
  and reduce that product's stock in MongoDB using
  Product.findByIdAndUpdate with $inc operator
  
  $inc: { stock: -qty } means "decrease stock by qty"
*/

const Order   = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const {
      items,
      subtotal,
      discount,
      deliveryCharge,
      total,
      paymentMethod,
      coupon
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Sanitize items — convert all types correctly
    const sanitizedItems = items.map(function(item) {
      return {
        productId: String(item.productId || item._id || ''),
        name:      String(item.name  || ''),
        emoji:     String(item.emoji || ''),
        image:     String(item.image || ''),
        price:     Number(item.price || 0),
        qty:       Number(item.qty   || 1)
      };
    });

    const now = new Date().toLocaleString('en-IN');

    const statusHistory = [
      { step: 'Order Placed',     time: now,                    done: true  },
      { step: 'Processing',       time: now,                    done: true  },
      { step: 'Shipped',          time: 'Expected in 1-2 days', done: false },
      { step: 'Out for Delivery', time: 'Will update soon',     done: false },
      { step: 'Delivered',        time: '',                      done: false }
    ];

    // ── STEP 1: Save the order ──
    const order = await Order.create({
      user:           req.user._id,
      items:          sanitizedItems,
      subtotal:       Number(subtotal       || 0),
      discount:       Number(discount       || 0),
      deliveryCharge: Number(deliveryCharge || 0),
      total:          Number(total),
      paymentMethod,
      coupon:         coupon || '',
      statusHistory
    });

    // ── STEP 2: Reduce stock for each ordered item ──
    // Loop through every item in the order
    // Find that product in MongoDB and decrease its stock
    const stockUpdatePromises = sanitizedItems.map(async function(item) {
      try {
        if (!item.productId || item.productId === '') return;

        await Product.findByIdAndUpdate(
          item.productId,
          {
            // $inc operator: increments a field by the given value
            // Using negative qty means DECREASE the stock
            // e.g. stock was 10, qty=1 → stock becomes 10 + (-1) = 9
            $inc: { stock: -item.qty }
          },
          {
            new: true // return updated document
          }
        );

        console.log(`📦 Stock updated: ${item.name} stock reduced by ${item.qty}`);

      } catch (stockErr) {
        // Don't fail the whole order if stock update fails
        // Just log the error
        console.error(`Stock update failed for ${item.name}:`, stockErr.message);
      }
    });

    // Wait for all stock updates to complete
    // Promise.all runs all updates at the same time (faster)
    await Promise.all(stockUpdatePromises);

    console.log(`✅ Order ${order._id} created, stock updated for ${sanitizedItems.length} items`);

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order._id,
      order
    });

  } catch (error) {
    console.error('createOrder error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/my — logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders — all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders };