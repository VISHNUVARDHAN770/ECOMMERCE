/*
  ╔══════════════════════════════════════════════════╗
  ║  js/db.js — Database Layer                      ║
  ║                                                  ║
  ║  This file handles ALL data storage using       ║
  ║  localStorage (the browser's built-in database) ║
  ║                                                  ║
  ║  WHY localStorage?                              ║
  ║  → No server needed                             ║
  ║  → Data survives page refresh                   ║
  ║  → Simple key-value storage                     ║
  ║                                                  ║
  ║  In a real project you'd replace this with      ║
  ║  a backend API (Node.js + MongoDB/MySQL)        ║
  ╚══════════════════════════════════════════════════╝
 
  KEYWORDS:
  • localStorage    → Browser's built-in storage
  • JSON.stringify  → Converts JS object → string (to store)
  • JSON.parse      → Converts string → JS object (to read)
  • try/catch       → Error handling block
  • const / let     → Variable declarations
    - const = never reassigned
    - let   = can be reassigned
  • export (if modules used) → makes variable available in other files
  • window.DB      → Attaching to window makes it global (accessible everywhere)
*/
 
// ════════════════════════════════
//   DB: Simple Database Object
// ════════════════════════════════
const DB = {
 
  // ── GET: Read a value from localStorage ──
  // key   = name of the data ("products", "users", etc)
  // def   = default value if key doesn't exist
  get(key, def = null) {
    try {
      const val = localStorage.getItem(key);
      // localStorage.getItem returns null if key doesn't exist
      return val ? JSON.parse(val) : def;
    } catch (e) {
      console.error('DB.get error:', e);
      return def;
    }
  },
 
  // ── SET: Write a value to localStorage ──
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error('DB.set error:', e);
      return false;
    }
  },
 
  // ── DELETE: Remove a key from localStorage ──
  delete(key) {
    localStorage.removeItem(key);
  },
 
  // ── CLEAR: Remove ALL app data ──
  clearAll() {
    const keysToRemove = ['products', 'users', 'orders'];
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
};
 
// ════════════════════════════════
//   INITIAL PRODUCT DATA
//   Loaded only once on first run
// ════════════════════════════════
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Sony WH-1000XM5',
    image:'assets/products/headphones.jpg',
    category: 'Electronics',
    price: 24999,
    origPrice: 32000,
    stock: 45,
    rating: 4.9,
    desc: 'Industry-leading noise cancellation with 30hr battery. Crystal clear audio with LDAC support.',
    tags: ['wireless', 'noise-cancelling', 'premium']
  },
  {
    id: 2,
    name: 'Nike Air Max 270',
    emoji: '👟',
    image:'assets/products/nike.jpg',
    category: 'Footwear',
    price: 8999,
    origPrice: 11000,
    stock: 120,
    rating: 4.7,
    desc: 'Revolutionary Air unit cushioning. Perfect for everyday wear and light workouts.',
    tags: ['sports', 'comfort', 'style']
  },
  {
    id: 3,
    name: 'MacBook Pro M3',
    emoji: '💻',
    image:'assets/products/macbook.jpg',
    category: 'Computers',
    price: 149999,
    origPrice: 175000,
    stock: 18,
    rating: 4.9,
    desc: 'Supercharged by M3 chip. Up to 22hr battery. The most powerful MacBook ever made.',
    tags: ['apple', 'laptop', 'M3']
  },
  {
    id: 4,
    name: 'Samsung QLED 4K TV',
    emoji: '📺',
    image:'assets/products/samsung.jpg',
    category: 'Electronics',
    price: 59999,
    origPrice: 79999,
    stock: 25,
    rating: 4.6,
    desc: 'Quantum Dot technology for vivid colors. 65-inch 4K with HDR10+ support.',
    tags: ['samsung', '4K', 'smart-tv']
  },
  {
    id: 5,
    name: 'Fitbit Charge 6',
    emoji: '⌚',
    image:'assets/products/fibit.jpg',
    category: 'Wearables',
    price: 12999,
    origPrice: 16000,
    stock: 67,
    rating: 4.5,
    desc: 'Advanced health tracking with ECG, SpO2, and Google Maps. 7-day battery.',
    tags: ['fitness', 'health', 'smartwatch']
  },
  {
    id: 6,
    name: 'Canon EOS R50',
    emoji: '📷',
    image:'assets/products/canon.jpg',
    category: 'Camera',
    price: 54999,
    origPrice: 65000,
    stock: 15,
    rating: 4.8,
    desc: 'Compact mirrorless with 24.2MP sensor. Perfect for creators with 4K video.',
    tags: ['camera', 'mirrorless', 'photography']
  },
  {
    id: 7,
    name: 'Kindle Paperwhite',
    emoji: '📚',
    image:'assets/products/kindle.jpg',
    category: 'Books & Reading',
    price: 8999,
    origPrice: 12000,
    stock: 90,
    rating: 4.7,
    desc: 'The thinnest Kindle with 6.8-inch glare-free display and 10-week battery.',
    tags: ['ebook', 'kindle', 'reading']
  },
  {
    id: 8,
    name: 'JBL Flip 6',
    emoji: '🔊',
    image:'assets/products/jbl.jpg',
    category: 'Audio',
    price: 6999,
    origPrice: 9999,
    stock: 55,
    rating: 4.6,
    desc: 'Powerful portable sound. IP67 waterproof with 12-hour playtime.',
    tags: ['bluetooth', 'speaker', 'waterproof']
  },
  {
    id: 9,
    name: 'PlayStation 5',
    emoji: '🎮',
    image:'assets/products/ps5.jpg',
    category: 'Gaming',
    price: 54990,
    origPrice: 59990,
    stock: 8,
    rating: 4.9,
    desc: 'Lightning-fast loading, deeper immersion. The next generation of gaming.',
    tags: ['gaming', 'console', 'sony']
  },
  {
    id: 10,
    name: 'Dyson V15 Vacuum',
    emoji: '🌀',
    image:'assets/products/dyson.jpg',
    category: 'Home Appliances',
    price: 44900,
    origPrice: 52000,
    stock: 20,
    rating: 4.7,
    desc: 'Most powerful Dyson cordless vacuum with laser dust detection.',
    tags: ['dyson', 'vacuum', 'home']
  },
  {
    id: 11,
    name: 'Instant Pot Pro',
    emoji: '🍲',
    image:'assets/products/pot.jpg',
    category: 'Kitchen',
    price: 9499,
    origPrice: 13000,
    stock: 40,
    rating: 4.5,
    desc: '9-in-1 pressure cooker. Replaces 9 kitchen appliances, saves 70% energy.',
    tags: ['cooking', 'kitchen']
  },
  {
    id: 12,
    name: "Levi's 511 Jeans",
    emoji: '👖',
    image:'assets/products/levis.jpg',
    category: 'Fashion',
    price: 2999,
    origPrice: 4500,
    stock: 200,
    rating: 4.4,
    desc: 'Classic slim fit with flex fabric. The perfect everyday jean.',
    tags: ['fashion', 'jeans']
  },
];
 
// ════════════════════════════════
//   INITIALIZE DATABASE
//   Called once when app starts
// ════════════════════════════════
// NEW — always reloads fresh product data on every start
function initDB() {
  DB.set('products', DEFAULT_PRODUCTS);  // ← always fresh, no "if" check
  if (!DB.get('users'))  DB.set('users', []);
  if (!DB.get('orders')) DB.set('orders', []);
}
 
// ════════════════════════════════
//   PRODUCT CRUD OPERATIONS
// ════════════════════════════════
 
function getAllProducts() {
  return DB.get('products', []);
}
 
function getProductById(id) {
  // Array.find() returns first matching item
  return getAllProducts().find(p => p.id === id) || null;
}
 
function addProduct(product) {
  const products = getAllProducts();
  // Generate a new unique ID
  const newId = products.length > 0
    ? Math.max(...products.map(p => p.id)) + 1
    : 1;
    // Math.max(...array) spreads array as arguments to get max value
  const newProduct = { ...product, id: newId };
  // Spread operator (...) copies all properties
  products.push(newProduct);
  DB.set('products', products);
  return newProduct;
}
 
function updateProduct(id, updatedData) {
  let products = getAllProducts();
  // Array.map() creates new array by transforming each item
  products = products.map(p =>
    p.id === id ? { ...p, ...updatedData } : p
    // If id matches, merge old+new data. Otherwise, keep unchanged.
  );
  DB.set('products', products);
}
 
function deleteProduct(id) {
  // Array.filter() creates new array with only items that pass the test
  const products = getAllProducts().filter(p => p.id !== id);
  DB.set('products', products);
}
 
// ════════════════════════════════
//   USER CRUD OPERATIONS
// ════════════════════════════════
 
function getAllUsers() {
  return DB.get('users', []);
}
 
function getUserByEmail(email) {
  return getAllUsers().find(u => u.email === email) || null;
}
 
function createUser(userData) {
  const users = getAllUsers();
  // Check duplicate email
  if (users.find(u => u.email === userData.email)) {
    return { error: 'Email already registered' };
  }
  const newUser = {
    id: Date.now(),   // Date.now() = current timestamp (unique number)
    ...userData,
    role: 'user'
  };
  users.push(newUser);
  DB.set('users', users);
  return newUser;
}
 
// ════════════════════════════════
//   ORDER CRUD OPERATIONS
// ════════════════════════════════
 
function getAllOrders() {
  return DB.get('orders', []);
}
 
function getOrdersByUser(userId) {
  return getAllOrders().filter(o => o.userId === userId);
}
 
function createOrder(orderData) {
  const orders = getAllOrders();
  const order = {
    id: 'ORD' + Date.now(),   // Unique order ID
    date: new Date().toISOString(),  // ISO format date string
    ...orderData,
    status: 'processing',
    statusHistory: [
      { step: 'Order Placed',     time: new Date().toLocaleString(), done: true  },
      { step: 'Processing',       time: new Date().toLocaleString(), done: true  },
      { step: 'Shipped',          time: 'Expected in 1-2 days',     done: false },
      { step: 'Out for Delivery', time: 'Will update soon',         done: false },
      { step: 'Delivered',        time: '',                          done: false },
    ]
  };
  orders.push(order);
  DB.set('orders', orders);
  return order;
}
 
// Make DB globally accessible
// window = the global browser object
// Attaching to window = available in all JS files
window.DB           = DB;
window.initDB       = initDB;
window.getAllProducts  = getAllProducts;
window.getProductById  = getProductById;
window.addProduct      = addProduct;
window.updateProduct   = updateProduct;
window.deleteProduct   = deleteProduct;
window.getAllUsers      = getAllUsers;
window.getUserByEmail  = getUserByEmail;
window.createUser      = createUser;
window.getAllOrders     = getAllOrders;
window.getOrdersByUser = getOrdersByUser;
window.createOrder     = createOrder;
 
console.log('📦 db.js loaded');