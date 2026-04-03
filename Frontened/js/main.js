/*
  FILE: frontend/js/main.js — FIXED

  BUGS FIXED:

  BUG 1: apiGetCurrentUser() does not exist
  This function was never defined in api.js
  FIX: Use localStorage to restore session instead
       Read saved currentUser from localStorage
       Check token exists → restore session directly
       No backend call needed for session restore

  BUG 2: Wrong admin email in console log
  Said admin@shopverse.com but actual is admin@eassybuy.com
  FIX: Updated to correct email
*/

document.addEventListener('DOMContentLoaded', async function () {

  console.log('🚀 EassYBuY starting...');

  // ──────────────────────────────
  // STEP 1: Initialize localStorage DB (fallback)
  // This seeds default products if DB is empty
  // ──────────────────────────────
  if (typeof initDB === 'function') {
    initDB();
  }

  // ──────────────────────────────
  // STEP 2: Try to restore previous login session
  //
  // BUG 1 FIX: was apiGetCurrentUser() — does not exist
  //
  // HOW SESSION RESTORE WORKS:
  // When user logs in → auth.js saves 2 things:
  //   localStorage.setItem('token', jwtToken)
  //   localStorage.setItem('currentUser', JSON.stringify(user))
  //
  // On page reload → we read those saved values
  // If both exist → user is still logged in → skip auth page
  // ──────────────────────────────
  try {

    const token    = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');

    if (token && savedUser) {

      // Restore user object from localStorage
      window.currentUser = JSON.parse(savedUser);

      console.log('✅ Session restored for:', window.currentUser.name);

      // Route to correct page based on role
      if (window.currentUser.role === 'admin') {

        // Admin session — no token needed
        renderAdminNavbar();
        showPage('admin');
        renderAdminDashboard();

      } else {

        // Regular user session
        window.cart = [];
        renderShopNavbar();
        showPage('shop');
        renderProducts();

      }

      // Session restored — skip auth page
      return;
    }

    // Admin saved without token (admin uses localStorage only)
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'admin') {
        window.currentUser = user;
        renderAdminNavbar();
        showPage('admin');
        renderAdminDashboard();
        return;
      }
    }

  } catch (err) {
    // If anything goes wrong with session restore,
    // clear bad data and show login page
    console.warn('Session restore failed:', err.message);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  // ──────────────────────────────
  // STEP 3: No saved session — show login page
  // ──────────────────────────────
  renderAuthPage();
  showPage('auth');
  console.log('✅ Auth page loaded');

  // ──────────────────────────────
  // STEP 4: Global keyboard shortcuts
  // ──────────────────────────────
  document.addEventListener('keydown', function (e) {
    // Press Escape to close any open modal
    if (e.key === 'Escape') {
      if (typeof closeModalDirect === 'function') {
        closeModalDirect();
      }
    }
  });

  // ──────────────────────────────
  // STEP 5: Startup message in console
  // Press F12 → Console tab to see this
  // BUG 2 FIX: wrong email was admin@shopverse.com
  // ──────────────────────────────
  console.log(`
╔═══════════════════════════════════════╗
║       EassYBuY is running! 🛍️        ║
║                                       ║
║   USER LOGIN:                         ║
║   Register a new account to login     ║
║                                       ║
║   ADMIN LOGIN:                        ║
║   Email:    admin@eassybuy.com        ║
║   Password: admin123                  ║
╚═══════════════════════════════════════╝
  `);

});