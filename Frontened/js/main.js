// FILE: frontend/js/main.js — FINAL VERSION

document.addEventListener('DOMContentLoaded', async function () {

  console.log('🚀 EassYBuY starting...');

  if (typeof initDB === 'function') initDB();

  try {
    const token     = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
      const user = JSON.parse(savedUser);

      if (user.role === 'admin') {
        window.currentUser = user;
        if (!token) saveToken('admin-local-token');
        renderAdminNavbar();
        showPage('admin');
        renderAdminDashboard();
        return;
      }

      if (token && user.role === 'user') {
        window.currentUser = user;
        window.cart        = [];
        renderShopNavbar();
        showPage('shop');
        renderProducts();
        return;
      }
    }

  } catch (err) {
    console.warn('Session restore failed:', err.message);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  renderAuthPage();
  showPage('auth');
  console.log('✅ Auth page loaded');

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (typeof closeModalDirect === 'function') closeModalDirect();
    }
  });

  // No admin credentials logged here for security
  console.log('✅ EassYBuY is ready!');
});