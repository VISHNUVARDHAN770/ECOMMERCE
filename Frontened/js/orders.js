/*
  FILE: frontend/js/orders.js — FIXED

  BUGS FIXED:

  BUG 1: No try/catch around apiGetMyOrders()
  If backend is down or token expired, the whole
  page crashes with an uncaught error
  FIX: Wrapped in try/catch with friendly error message

  BUG 2: userId variable declared but never used
  const userId = window.currentUser.id || window.currentUser.email;
  This line does nothing — apiGetMyOrders() uses
  the JWT token from localStorage to identify the user
  FIX: Removed the unused variable

  BUG 3: item.emoji could be undefined/null
  ${item.emoji} renders as "undefined" text on screen
  FIX: Use item.emoji || '📦' as fallback

  BONUS FIX: Added loading state while fetching orders
  so page does not appear blank during API call
*/


// ════════════════════════════════
//  RENDER ORDERS PAGE
// ════════════════════════════════
async function renderOrders() {

  const page     = document.getElementById('page-orders');
  const navbar   = page.querySelector('.navbar');
  const navHTML  = navbar ? navbar.outerHTML : '';

  // Check if user is logged in
  if (!window.currentUser) {
    showPage('auth');
    return;
  }

  // Show loading state while API call is in progress
  page.innerHTML = navHTML + `
    <div class="orders-page">
      <h2 class="section-title">📦 My Orders</h2>
      <p class="section-sub">Track all your orders in real time</p>
      <div style="color:var(--text2);padding:2rem;text-align:center">
        Loading your orders...
      </div>
    </div>`;

  try {

    // Fetch this user's orders from backend
    // apiGetMyOrders is defined in api.js
    // It calls GET http://localhost:5000/api/orders/my
    // and sends the JWT token so backend knows which user
    const orders = await apiGetMyOrders();

    // No orders yet
    if (!orders || orders.length === 0) {
      page.innerHTML = navHTML + `
        <div class="orders-page">
          <h2 class="section-title">📦 My Orders</h2>
          <p class="section-sub">Track all your orders in real time</p>
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <div class="empty-title">No orders yet</div>
            <p>Your orders will appear here once placed</p>
            <button class="btn-primary"
              style="width:auto;padding:.65rem 2rem;margin-top:1.5rem"
              onclick="showPage('shop')">
              Start Shopping →
            </button>
          </div>
        </div>`;
      return;
    }

    // Show newest orders first using reverse()
    // [...orders] creates a copy before reversing
    // so original array is not modified
    const ordersHTML = [...orders]
      .reverse()
      .map(function(order) { return renderOrderCard(order); })
      .join('');

    page.innerHTML = navHTML + `
      <div class="orders-page">
        <h2 class="section-title">📦 My Orders</h2>
        <p class="section-sub">Track all your orders in real time</p>
        ${ordersHTML}
      </div>`;

  } catch (error) {
    // BUG 1 FIX: show friendly error instead of page crash
    page.innerHTML = navHTML + `
      <div class="orders-page">
        <h2 class="section-title">📦 My Orders</h2>
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Could not load orders</div>
          <p style="color:var(--accent2)">${error.message}</p>
          <button class="btn-primary"
            style="width:auto;padding:.65rem 1.5rem;margin-top:1rem"
            onclick="renderOrders()">
            Try Again
          </button>
        </div>
      </div>`;
  }
}


// ════════════════════════════════
//  RENDER ONE ORDER CARD
// ════════════════════════════════
function renderOrderCard(order) {

  // Format the order date
  const date          = new Date(order.createdAt || order.date);
  const formattedDate = date.toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  });

  // Payment method label with icon
  const paymentLabels = {
    upi:        '📱 UPI',
    card:       '💳 Card',
    netbanking: '🏦 Net Banking',
    cod:        '🏠 Pay on Delivery'
  };
  const paymentLabel = paymentLabels[order.paymentMethod] || order.paymentMethod;

  // Status badge CSS class
  // e.g. "out_for_delivery" → "status-out_for_delivery"
  const statusClass = 'status-' + (order.status || 'processing')
    .replace(/ /g, '_')
    .toLowerCase();

  // Tracking timeline data
  const history      = order.statusHistory || [];
  const doneCount    = history.filter(function(s) { return s.done; }).length;
  const currentIndex = doneCount - 1;  // last completed step is "current"

  return `
    <div class="order-card">

      <!-- ── ORDER HEADER ── -->
      <div class="order-header">
        <div>
          <div class="order-id">🎫 ${order._id}</div>
          <div class="order-meta">
            ${formattedDate}
            &nbsp;·&nbsp; ${paymentLabel}
            &nbsp;·&nbsp;
            <strong style="color:var(--accent)">
              ₹${(order.total || 0).toLocaleString()}
            </strong>
          </div>
        </div>
        <div class="order-status ${statusClass}">
          ${(order.status || 'processing').replace(/_/g, ' ')}
        </div>
      </div>

      <!-- ── ORDERED ITEMS ── -->
      <div class="order-items-list">
        ${(order.items || []).map(function(item) {
          return `
            <div class="order-item-chip">
              ${item.emoji || '📦'} ${item.name} ×${item.qty}
            </div>`;
            /* BUG 3 FIX: item.emoji || '📦'
               Without fallback, undefined emoji shows as
               the text "undefined" on screen */
        }).join('')}
      </div>

      <!-- ── TRACKING TIMELINE ── -->
      <div class="tracking-timeline">
        <div style="font-weight:600;font-size:.85rem;color:var(--text3);
          text-transform:uppercase;letter-spacing:.06em;margin-bottom:1rem">
          Live Tracking
        </div>

        ${history.map(function(step, index) {

          // Determine dot style for each step
          var dotClass;
          if (!step.done) {
            dotClass = 'pending';       // not reached yet
          } else if (index === currentIndex) {
            dotClass = 'current';       // current step — pulsing animation
          } else {
            dotClass = 'done';          // already completed
          }

          return `
            <div class="timeline-step">
              <div class="timeline-dot ${dotClass}">
                ${step.done ? '✓' : (index + 1)}
              </div>
              <div class="timeline-content">
                <div class="timeline-label ${step.done ? '' : 'pending'}">
                  ${step.step}
                </div>
                <div class="timeline-time">
                  ${step.time || ''}
                </div>
              </div>
            </div>`;

        }).join('')}
      </div>

    </div>`;
}


// ════════════════════════════════
//  EXPOSE GLOBALLY
// ════════════════════════════════
window.renderOrders    = renderOrders;
window.renderOrderCard = renderOrderCard;

console.log('📦 orders.js loaded');