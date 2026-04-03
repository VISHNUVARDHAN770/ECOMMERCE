/*
  ╔══════════════════════════════════════════════════╗
  ║  frontend/js/api.js                             ║
  ║                                                  ║
  ║  This is the BRIDGE between frontend and        ║
  ║  backend. Every single API call goes here.      ║
  ║                                                  ║
  ║  HOW IT WORKS:                                  ║
  ║  Frontend (browser) ──fetch()──► Backend :5000  ║
  ║  Backend             ──JSON──►  Frontend        ║
  ║                                                  ║
  ║  KEYWORDS:                                      ║
  ║  fetch()      = browser built-in function that  ║
  ║                 sends HTTP requests to server   ║
  ║  async/await  = wait for server to reply        ║
  ║  JWT token    = a string that proves you are    ║
  ║                 logged in, sent with requests   ║
  ║  Bearer       = format for sending JWT token    ║
  ║                 "Authorization: Bearer <token>" ║
  ║  localStorage = browser storage — saves token  ║
  ║                 so user stays logged in         ║
  ╚══════════════════════════════════════════════════╝
*/

// ════════════════════════════════
//  BACKEND URL
//  All API calls go to this address
//  Your backend server.js runs here
// ════════════════════════════════
const API_URL = "https://eassybuy-backend.onrender.com/api";
// ════════════════════════════════
//  TOKEN HELPERS
//  JWT token is saved in browser
//  localStorage after login.
//  It is sent with every request
//  that needs authentication.
// ════════════════════════════════

// Save token after login
function saveToken(token) {
  localStorage.setItem('token', token);
}

// Get saved token (returns null if not logged in)
function getToken() {
  return localStorage.getItem('token');
}

// Delete token on logout
function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
}


// ════════════════════════════════
//  CORE API FUNCTION
//  All API calls use this one function
//
//  Parameters:
//  endpoint     = URL path e.g. '/auth/login'
//  method       = 'GET', 'POST', 'PUT', 'DELETE'
//  body         = data to send (for POST/PUT)
//  requiresAuth = true if login token is needed
// ════════════════════════════════
async function apiCall(endpoint, method, body, requiresAuth) {

  method       = method       || 'GET';
  body         = body         || null;
  requiresAuth = requiresAuth || false;

  var options = {
    method: method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (requiresAuth) {
    var token = getToken();
    if (!token) {
      throw new Error('You are not logged in. Please login first.');
    }
    options.headers['Authorization'] = 'Bearer ' + token;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    var response = await fetch(API_URL + endpoint, options);
    var data     = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong on the server');
    }

    return data;

  } catch (err) {
    // Render free tier sleeps after 15 min inactivity
    // When waking up, fetch throws "Failed to fetch"
    // Show a friendly message instead
    if (err.name === 'TypeError' ||
        String(err.message).includes('Failed to fetch') ||
        String(err.message).includes('NetworkError') ||
        String(err.message).includes('fetch')) {
      throw new Error('Server is starting up, please wait 30 seconds and try again 🔄');
    }
    throw err;
  }
}


// ════════════════════════════════
//  AUTH API CALLS
//  Connects to backend/routes/authRoutes.js
// ════════════════════════════════

// Register new user account
// Calls: POST http://localhost:5000/api/auth/register
// Sends: { name, email, password }
// Returns: { message, user, token }
async function apiRegister(name, email, password) {
  return await apiCall(
    '/auth/register',   // endpoint
    'POST',             // method
    { name: name, email: email, password: password },  // body
    false               // no auth needed to register
  );
}

// Login existing user
// Calls: POST http://localhost:5000/api/auth/login
// Sends: { email, password }
// Returns: { message, user, token }
async function apiLogin(email, password) {
  return await apiCall(
    '/auth/login',
    'POST',
    { email: email, password: password },
    false  // no auth needed to login
  );
}


// ════════════════════════════════
//  PRODUCT API CALLS
//  Connects to backend/routes/productRoutes.js
// ════════════════════════════════

// Get ALL products (no login needed — anyone can view)
// Calls: GET http://localhost:5000/api/products
// Returns: array of product objects
async function apiFetchProducts() {
  return await apiCall('/products', 'GET', null, false);
}

// Get ONE product by its MongoDB _id
// Calls: GET http://localhost:5000/api/products/:id
// Returns: single product object
async function apiFetchProductById(id) {
  return await apiCall('/products/' + id, 'GET', null, false);
}

// Add NEW product (admin only — needs token)
// Calls: POST http://localhost:5000/api/products
// Sends: product data object
// Returns: { message, product }
async function apiAddProduct(productData) {
  return await apiCall('/products', 'POST', productData, true);
  // true = requiresAuth → sends JWT token in header
}

// Update EXISTING product (admin only)
// Calls: PUT http://localhost:5000/api/products/:id
// Sends: updated product data
// Returns: { message, product }
async function apiUpdateProduct(id, productData) {
  return await apiCall('/products/' + id, 'PUT', productData, true);
}

// Delete product (admin only)
// Calls: DELETE http://localhost:5000/api/products/:id
// Returns: { message }
async function apiDeleteProduct(id) {
  return await apiCall('/products/' + id, 'DELETE', null, true);
}


// ════════════════════════════════
//  ORDER API CALLS
//  Connects to backend/routes/orderRoutes.js
// ════════════════════════════════

// Place a new order (must be logged in)
// Calls: POST http://localhost:5000/api/orders
// Sends: order data (items, total, payment method etc.)
// Returns: { message, orderId, order }
async function apiCreateOrder(orderData) {
  return await apiCall('/orders', 'POST', orderData, true);
  // true = requiresAuth → server reads user id from token
}

// Get orders of the currently logged-in user
// Calls: GET http://localhost:5000/api/orders/my
// Returns: array of order objects
async function apiGetMyOrders() {
  return await apiCall('/orders/my', 'GET', null, true);
}

// Get ALL orders (admin only)
// Calls: GET http://localhost:5000/api/orders
// Returns: array of all orders with user info
async function apiGetAllOrders() {
  return await apiCall('/orders', 'GET', null, true);
}


// ════════════════════════════════
//  EXPOSE ALL FUNCTIONS GLOBALLY
//  So other JS files can call them
//  e.g. auth.js calls apiLogin()
//       cart.js calls apiFetchProductById()
//       payment.js calls apiCreateOrder()
//       admin.js calls apiAddProduct()
// ════════════════════════════════
window.API_URL             = API_URL;
window.saveToken           = saveToken;
window.getToken            = getToken;
window.removeToken         = removeToken;
window.apiCall             = apiCall;
window.apiRegister         = apiRegister;
window.apiLogin            = apiLogin;
window.apiFetchProducts    = apiFetchProducts;
window.apiFetchProductById = apiFetchProductById;
window.apiAddProduct       = apiAddProduct;
window.apiUpdateProduct    = apiUpdateProduct;
window.apiDeleteProduct    = apiDeleteProduct;
window.apiCreateOrder      = apiCreateOrder;
window.apiGetMyOrders      = apiGetMyOrders;
window.apiGetAllOrders     = apiGetAllOrders;

console.log('🌐 api.js loaded — connecting to:', API_URL);