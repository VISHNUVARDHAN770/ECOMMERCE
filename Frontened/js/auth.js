/*
  FILE: frontend/js/auth.js — FIXED

  BUG: Admin login never saved a JWT token
  So when admin tried to add/edit/delete products,
  api.js checked for token → found nothing → "not logged in"

  FIX: Save a special token 'admin-local-token' when
  admin logs in. Backend middleware now recognizes this
  special token and grants admin access.
*/

const ADMIN_EMAIL    = 'admin@eassybuy.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME     = 'Store Admin';

window.currentUser = null;


// ════════════════════════════════
//  RENDER AUTH PAGE
// ════════════════════════════════
function renderAuthPage() {
  document.getElementById('page-auth').innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">EassYBuY✦</div>
        <p class="auth-subtitle">Your premium shopping destination 🛍️</p>

        <div class="auth-tabs">
          <button class="auth-tab active" id="tab-login"
            onclick="switchAuthTab('login')">Login</button>
          <button class="auth-tab" id="tab-register"
            onclick="switchAuthTab('register')">Register</button>
        </div>

        <!-- LOGIN FORM -->
        <div id="form-login">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-input" id="login-email"
              placeholder="you@example.com"
              onkeydown="if(event.key==='Enter') handleLogin()"/>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="login-password"
              placeholder="••••••••"
              onkeydown="if(event.key==='Enter') handleLogin()"/>
          </div>
          <button class="btn-primary" id="login-btn" onclick="handleLogin()">
            Sign In →
          </button>
        </div>

        <!-- REGISTER FORM -->
        <div id="form-register" style="display:none">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="reg-name" placeholder="John Doe"/>
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-input" id="reg-email" placeholder="you@example.com"/>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="reg-password" placeholder="••••••••"/>
          </div>
          <button class="btn-primary" id="register-btn" onclick="handleRegister()">
            Create Account →
          </button>
        </div>
      </div>
    </div>`;
}


// ════════════════════════════════
//  SWITCH TABS
// ════════════════════════════════
function switchAuthTab(tab) {
  document.getElementById('form-login').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active',    tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}


// ════════════════════════════════
//  HANDLE LOGIN
// ════════════════════════════════
async function handleLogin() {
  console.log("✅ LOGIN FUNCTION STARTED");

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-password').value.trim();

  console.log("📩 Email:", email);
  console.log("🔑 Password:", pass);

  if (!email || !pass) {
    toast('⚠️', 'Please fill in all fields');
    return;
  }

  // ── ADMIN LOGIN ──
  if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
    console.log("👑 Admin login detected");

    window.currentUser = {
      id:    'admin',
      name:  ADMIN_NAME,
      email: ADMIN_EMAIL,
      role:  'admin'
    };

    saveToken('admin-local-token');
    localStorage.setItem('currentUser', JSON.stringify(window.currentUser));

    toast('✅', 'Welcome back, Admin!');
    renderAdminNavbar();
    showPage('admin');
    renderAdminDashboard();
    return;
  }

  // ── USER LOGIN ──
  const btn = document.getElementById('login-btn');
  btn.textContent = 'Signing in...';
  btn.disabled    = true;

  try {
    console.log("🚀 Calling API...");

    const data = await apiLogin(email, pass);

    console.log("✅ API RESPONSE:", data);

    saveToken(data.token);
    window.currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(data.user));

    window.cart          = [];
    window.appliedCoupon = null;

    toast('🎉', `Welcome back, ${data.user.name}!`);
    renderShopNavbar();
    showPage('shop');
    renderProducts();

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    toast('❌', err.message);
  } finally {
    btn.textContent = 'Sign In →';
    btn.disabled    = false;
  }
}


// ════════════════════════════════
//  HANDLE REGISTER
// ════════════════════════════════
async function handleRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-password').value.trim();

  if (!name || !email || !pass) { toast('⚠️', 'Please fill in all fields'); return; }
  if (pass.length < 6)          { toast('⚠️', 'Password must be at least 6 characters'); return; }

  const btn = document.getElementById('register-btn');
  btn.textContent = 'Creating account...';
  btn.disabled    = true;

  try {
    await apiRegister(name, email, pass);
    toast('🎉', 'Account created! Please login.');
    switchAuthTab('login');
  } catch (err) {
    toast('❌', err.message);
  } finally {
    btn.textContent = 'Create Account →';
    btn.disabled    = false;
  }
}


// ════════════════════════════════
//  LOGOUT
// ════════════════════════════════
function logout() {
  removeToken();
  window.currentUser   = null;
  window.cart          = [];
  window.appliedCoupon = null;
  localStorage.removeItem('currentUser');
  toast('👋', 'Logged out successfully');
  renderAuthPage();
  showPage('auth');
}


// ════════════════════════════════
//  RESTORE SESSION ON PAGE LOAD
// ════════════════════════════════
function restoreSession() {
  const token    = localStorage.getItem('token');
  const savedUser = localStorage.getItem('currentUser');

  if (!savedUser) return false;

  try {
    const user = JSON.parse(savedUser);

    if (user.role === 'admin') {
      window.currentUser = user;
      // Restore admin token if missing
      if (!token) saveToken('admin-local-token');
      renderAdminNavbar();
      showPage('admin');
      renderAdminDashboard();
      return true;
    }

    if (token && user.role === 'user') {
      window.currentUser = user;
      window.cart        = [];
      renderShopNavbar();
      showPage('shop');
      renderProducts();
      return true;
    }

  } catch (e) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  return false;
}


// ════════════════════════════════
//  NAVBARS
// ════════════════════════════════
function renderShopNavbar() {
  const navbarHTML = `
    <nav class="navbar">
      <div class="nav-logo" onclick="showPage('shop')">EassYBuY✦</div>
      <div class="nav-links">
        <button class="nav-btn" onclick="showPage('shop')">🏠 Home</button>
        <button class="nav-btn" onclick="showPage('orders')">📦 My Orders</button>
        <button class="nav-btn" style="color:var(--text3);cursor:default">
          👤 ${window.currentUser ? window.currentUser.name : ''}
        </button>
        <button class="nav-btn" onclick="logout()">Logout</button>
        <div class="navbar-search">
          <input type="text" id="search-input"
            placeholder="Search products..."
            oninput="searchProducts()"/>
        </div>
        <button class="cart-btn" onclick="showPage('cart')">
          🛒 Cart <span class="cart-count">0</span>
        </button>
      </div>
    </nav>`;

  ['shop','product','cart','orders'].forEach(function(page) {
    const el  = document.getElementById('page-' + page);
    const old = el.querySelector('.navbar');
    if (old) old.remove();
    el.insertAdjacentHTML('afterbegin', navbarHTML);
  });
}

function renderAdminNavbar() {
  const navbarHTML = `
    <nav class="navbar">
      <div class="nav-logo">EassYBuY Admin ⚙️</div>
      <div class="nav-links">
        <button class="nav-btn" style="color:var(--text3);cursor:default">
          👤 ${ADMIN_NAME}
        </button>
        <button class="nav-btn" onclick="logout()">Logout</button>
      </div>
    </nav>`;

  const el  = document.getElementById('page-admin');
  const old = el.querySelector('.navbar');
  if (old) old.remove();
  el.insertAdjacentHTML('afterbegin', navbarHTML);
}


// ════════════════════════════════
//  EXPOSE GLOBALLY
// ════════════════════════════════
window.renderAuthPage    = renderAuthPage;
window.switchAuthTab     = switchAuthTab;
window.handleLogin       = handleLogin;
window.handleRegister    = handleRegister;
window.logout            = logout;
window.restoreSession    = restoreSession;
window.renderShopNavbar  = renderShopNavbar;
window.renderAdminNavbar = renderAdminNavbar;

console.log('🔐 auth.js loaded');