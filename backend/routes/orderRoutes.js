// FILE: backend/routes/orderRoutes.js
const express                = require('express');
const router                 = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createOrder,
  getMyOrders,
  getAllOrders
} = require('../controllers/orderController');

router.post('/',   protect,              createOrder);
router.get('/my',  protect,              getMyOrders);
router.get('/',    protect, adminOnly,   getAllOrders);

module.exports = router;