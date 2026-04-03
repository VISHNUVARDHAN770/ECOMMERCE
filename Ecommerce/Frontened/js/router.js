/*
  FILE: frontend/js/router.js — FIXED

  BUGS FIXED:

  BUG 1: const toast = showToast
  Using const at file scope to alias a function
  causes "Cannot redeclare block-scoped variable"
  error in strict mode browsers
  FIX: Use window.toast = showToast instead
  This makes toast globally available safely

  BUG 2: const modalOverlay = document.getElementById(...)
  This runs IMMEDIATELY when router.js loads
  At that moment the HTML elements may not exist yet
  so getElementById returns null → click handler
  never gets attached → clicking outside modal
  does nothing
  FIX: Move the event listener inside DOMContentLoaded
  so it only runs AFTER all HTML is fully parsed
*/


// ════════════════════════════════
//  SHOW PAGE
//  Hides all pages, shows target page
//  Then calls that page's render function
// ════════════════════════════════
function showPage(pageName) {

  // Step 1: Hide ALL pages
  document.querySelectorAll('.page').forEach(function(page) {
    page.classList.remove('active');
  });

  // Step 2: Show the target page
  var targetPage = document.getElementById('page-' + pageName);

  if (!targetPage) {
    console.error('Page not found: page-' + pageName);
    return;
  }

  targetPage.classList.add('active');

  // Step 3: Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Step 4: Call the render function for this page
  switch (pageName) {

    case 'shop':
      if (typeof renderProducts === 'function') renderProducts();
      break;

    case 'cart':
      if (typeof renderCart === 'function') renderCart();
      break;

    case 'orders':
      if (typeof renderOrders === 'function') renderOrders();
      break;

    case 'admin':
      if (typeof renderAdminDashboard === 'function') renderAdminDashboard();
      break;

  }

  console.log('📍 Navigated to:', pageName);
}


// ════════════════════════════════
//  UPDATE CART COUNT BADGE
//  Updates the red number on cart button
// ════════════════════════════════
function updateCartCount() {
  var cart  = window.cart || [];
  var count = cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
  document.querySelectorAll('.cart-count').forEach(function(el) {
    el.textContent = count;
  });
}


// ════════════════════════════════
//  TOAST NOTIFICATION
//  Shows popup message at bottom-right
//  Auto-hides after duration ms
// ════════════════════════════════
var toastTimer = null;

function showToast(icon, message, duration) {

  duration = duration || 3000;  // default 3 seconds

  var toastEl   = document.getElementById('toast');
  var iconEl    = document.getElementById('toast-icon');
  var textEl    = document.getElementById('toast-text');

  if (!toastEl) return;

  // Clear any existing timer
  if (toastTimer) clearTimeout(toastTimer);

  iconEl.textContent = icon;
  textEl.textContent = message;

  // Show the toast
  toastEl.classList.remove('hidden');

  // Auto-hide after duration
  toastTimer = setTimeout(function() {
    toastEl.classList.add('hidden');
  }, duration);
}

// BUG 1 FIX: was const toast = showToast
// const at file scope causes redeclaration errors
// window.toast makes it safely global
window.toast = showToast;


// ════════════════════════════════
//  MODAL OPEN / CLOSE
// ════════════════════════════════
function openModal() {
  var overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.add('open');
}

function closeModalDirect() {
  var overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
}


// ════════════════════════════════
//  ATTACH MODAL + KEYBOARD EVENTS
//  BUG 2 FIX: moved inside DOMContentLoaded
//  so HTML elements exist before we query them
// ════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {

  // Click outside modal box → close modal
  // BUG 2 FIX: was running immediately at file load
  // At that time modal-overlay did not exist yet → null
  // Now runs after DOM is ready → element exists ✅
  var modalOverlay = document.getElementById('modal-overlay');

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      // Only close if user clicked the dark overlay
      // NOT if they clicked inside the modal box itself
      if (e.target === this) {
        closeModalDirect();
      }
    });
  }

  // Press Escape key → close modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModalDirect();
    }
  });

});


// ════════════════════════════════
//  EXPOSE GLOBALLY
// ════════════════════════════════
window.showPage         = showPage;
window.updateCartCount  = updateCartCount;
window.showToast        = showToast;
window.openModal        = openModal;
window.closeModalDirect = closeModalDirect;

console.log('🗺️ router.js loaded');