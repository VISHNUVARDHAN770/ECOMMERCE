/*
  FILE: frontend/js/api.js — FINAL DEPLOYMENT VERSION
*/

// ── BACKEND URL ─────────────────────────────────────
// Automatically switches between local and live server
const API_URL = 'https://eassybuy-backend.onrender.com/api';

// ── TOKEN HELPERS ────────────────────────────────────
function saveToken(token)  { localStorage.setItem('token', token); }
function getToken()        { return localStorage.getItem('token'); }
function removeToken()     {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
}

// ── CORE API FUNCTION ────────────────────────────────
async function apiCall(endpoint, method, body, requiresAuth) {
  method       = method       || 'GET';
  body         = body         || null;
  requiresAuth = requiresAuth || false;

  var options = {
    method:  method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (requiresAuth) {
    var token = getToken();
    if (!token) throw new Error('You are not logged in. Please login first.');
    options.headers['Authorization'] = 'Bearer ' + token;
  }

  if (body) options.body = JSON.stringify(body);

  try {
    var response = await fetch(API_URL + endpoint, options);
    var data     = await response.json();
    if (!response.ok) throw new Error(data.message || 'Server error');
    return data;

  } catch (err) {
    if (err.name === 'TypeError' ||
        String(err.message).includes('Failed to fetch') ||
        String(err.message).includes('NetworkError')) {
      throw new Error('Server is starting up, please wait 30 seconds and try again 🔄');
    }
    throw err;
  }
}

// ── AUTH ─────────────────────────────────────────────
async function apiRegister(name, email, password) {
  return await apiCall('/auth/register', 'POST', { name, email, password }, false);
}
async function apiLogin(email, password) {
  return await apiCall('/auth/login', 'POST', { email, password }, false);
}

// ── PRODUCTS ─────────────────────────────────────────
async function apiFetchProducts()         { return await apiCall('/products', 'GET', null, false); }
async function apiFetchProductById(id)    { return await apiCall('/products/'+id, 'GET', null, false); }
async function apiAddProduct(data)        { return await apiCall('/products', 'POST', data, true); }
async function apiUpdateProduct(id, data) { return await apiCall('/products/'+id, 'PUT', data, true); }
async function apiDeleteProduct(id)       { return await apiCall('/products/'+id, 'DELETE', null, true); }

// ── ORDERS ───────────────────────────────────────────
async function apiCreateOrder(data)  { return await apiCall('/orders', 'POST', data, true); }
async function apiGetMyOrders()      { return await apiCall('/orders/my', 'GET', null, true); }
async function apiGetAllOrders()     { return await apiCall('/orders', 'GET', null, true); }

// ── EXPOSE GLOBALLY ──────────────────────────────────
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

console.log('🌐 api.js loaded — Backend:', API_URL);