/*
  FILE: frontend/js/cart.js — FULLY FIXED
  
  3 BUGS THAT WERE FIXED:
  
  BUG 1: window.products.find(p => p.id === productId)
  → window.products does not exist when using backend
  → MongoDB products use _id not id
  FIX: fetch product from backend using apiFetchProductById()
  
  BUG 2: All cart comparisons used c.id
  → MongoDB uses _id (string like "6712abc...")
  FIX: use String(c._id || c.id) for all comparisons
  
  BUG 3: renderCart() wiped out the navbar
  → page.innerHTML = `...` deletes everything including navbar
  FIX: save navbar HTML first, then put it back
*/

window.cart          = [];
window.appliedCoupon = null;


// ════════════════════════════════
//  ADD TO CART
//  FIXED: fetch product from backend
//  instead of window.products
// ════════════════════════════════
function addToCart(productId, buttonEl) {

  // Convert to string — MongoDB _id is a string
  const id = String(productId);

  // Check if already in cart using String comparison
  const alreadyIn = window.cart.some(c => String(c._id || c.id) === id);

  if (alreadyIn) {
    // Already in cart — go to cart page
    showPage('cart');
    return;
  }

  // Disable button while loading
  if (buttonEl) {
    buttonEl.textContent = 'Adding...';
    buttonEl.disabled    = true;
  }

  // Fetch product from backend and add to cart
  apiFetchProductById(id)
    .then(function(product) {
      // Add product to cart with qty = 1
      window.cart.push({ ...product, qty: 1 });

      updateCartCount();

      // Update button
      if (buttonEl) {
        buttonEl.textContent = '✓ Added to Cart';
        buttonEl.classList.add('added');
        buttonEl.disabled    = false;
      }

      // Update all buttons for this product on the page
      document.querySelectorAll('[id^="cbtn-"], [id^="dbtn-"]').forEach(function(btn) {
        if (btn.id === 'cbtn-' + id || btn.id === 'dbtn-' + id) {
          btn.textContent = '✓ Added to Cart';
          btn.classList.add('added');
        }
      });

      toast('🛒', product.name + ' added to cart!');
    })
    .catch(function(error) {
      toast('❌', 'Could not add to cart: ' + error.message);
      if (buttonEl) {
        buttonEl.textContent = 'Add to Cart 🛒';
        buttonEl.disabled    = false;
      }
    });
}


// ════════════════════════════════
//  REMOVE FROM CART
//  FIXED: String comparison for _id
// ════════════════════════════════
function removeFromCart(productId) {
  const id    = String(productId);
  window.cart = window.cart.filter(function(c) {
    return String(c._id || c.id) !== id;
  });
  updateCartCount();
  renderCart();
  toast('🗑️', 'Item removed from cart');
}


// ════════════════════════════════
//  CHANGE QUANTITY
//  FIXED: String comparison for _id
// ════════════════════════════════
function changeQty(productId, delta) {
  const id   = String(productId);
  const item = window.cart.find(function(c) {
    return String(c._id || c.id) === id;
  });
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  updateCartCount();
  renderCart();
}


// ════════════════════════════════
//  APPLY COUPON
// ════════════════════════════════
function applyCoupon() {
  const code     = document.getElementById('coupon-input').value.trim().toUpperCase();
  const subtotal = getCartSubtotal();

  if (!code) {
    showCouponMsg('error', '⚠️ Please enter a coupon code');
    return;
  }

  if (code === 'SAVE100') {
    if (subtotal < 499) {
      showCouponMsg('error', '❌ Coupon valid only on orders above ₹499');
      window.appliedCoupon = null;
    } else {
      window.appliedCoupon = 'SAVE100';
      showCouponMsg('success', '✅ Coupon applied! ₹100 off');
      toast('🎉', 'Coupon SAVE100 applied!');
    }
  } else {
    showCouponMsg('error', '❌ Invalid coupon. Try SAVE100');
    window.appliedCoupon = null;
  }

  updateOrderSummary();
}

function showCouponMsg(type, text) {
  const el = document.getElementById('coupon-msg');
  if (!el) return;
  el.className   = 'coupon-msg ' + type;
  el.textContent = text;
}


// ════════════════════════════════
//  CALCULATIONS
// ════════════════════════════════
function getCartSubtotal() {
  return window.cart.reduce(function(sum, item) {
    return sum + (item.price * item.qty);
  }, 0);
}

function getDiscount() {
  return (window.appliedCoupon === 'SAVE100' && getCartSubtotal() >= 499) ? 100 : 0;
}

function getDelivery() {
  return getCartSubtotal() >= 499 ? 0 : 49;
}

function getTotal() {
  return getCartSubtotal() + getDelivery() - getDiscount();
}


// ════════════════════════════════
//  UPDATE ORDER SUMMARY
// ════════════════════════════════
function updateOrderSummary() {
  const sub      = getCartSubtotal();
  const discount = getDiscount();
  const delivery = getDelivery();
  const total    = getTotal();

  function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  set('sum-subtotal', '₹' + sub.toLocaleString());
  set('sum-delivery', delivery === 0 ? 'FREE 🎉' : '₹' + delivery);
  set('sum-total',    '₹' + total.toLocaleString());

  const discRow = document.getElementById('sum-discount-row');
  if (discRow) {
    discRow.style.display = discount > 0 ? 'flex' : 'none';
    set('sum-discount', '-₹' + discount);
  }
}


// ════════════════════════════════
//  RENDER CART PAGE
//  FIXED: saves navbar and puts it back
//  so it doesn't disappear on re-render
// ════════════════════════════════
function renderCart() {
  const page = document.getElementById('page-cart');

  // Save navbar HTML before overwriting
  const navbar    = page.querySelector('.navbar');
  const navbarHTML = navbar ? navbar.outerHTML : '';

  if (window.cart.length === 0) {
    page.innerHTML = navbarHTML + `
      <div class="cart-page">
        <h2 class="section-title" style="margin-bottom:1.5rem">🛒 Your Cart</h2>
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <div class="empty-title">Your cart is empty</div>
          <p>Add some products to continue shopping</p>
          <button class="btn-primary"
            style="margin-top:1.5rem;width:auto;padding:.65rem 2rem"
            onclick="showPage('shop')">
            Browse Products →
          </button>
        </div>
      </div>`;
    return;
  }

  page.innerHTML = navbarHTML + `
    <div class="cart-page">
      <h2 class="section-title" style="margin-bottom:1.5rem">
        🛒 Your Cart (${window.cart.length} item${window.cart.length > 1 ? 's' : ''})
      </h2>

      <div class="cart-layout">

        <!-- LEFT: Cart Items -->
        <div class="cart-items-list">
          ${window.cart.map(function(item) { return renderCartItem(item); }).join('')}
        </div>

        <!-- RIGHT: Order Summary -->
        <div>
          <div class="order-summary">
            <div class="summary-title">Order Summary</div>

            <div class="summary-row">
              <span>Subtotal</span>
              <span id="sum-subtotal">₹0</span>
            </div>

            <div class="summary-row discount" id="sum-discount-row" style="display:none">
              <span>🏷️ Discount (SAVE100)</span>
              <span id="sum-discount">-₹0</span>
            </div>

            <div class="summary-row">
              <span>Delivery</span>
              <span id="sum-delivery">₹49</span>
            </div>

            <div class="summary-row total">
              <span>Total</span>
              <span id="sum-total">₹0</span>
            </div>

            <!-- COUPON -->
            <div style="margin:1.2rem 0">
              <div class="coupon-label">Apply Coupon Code</div>
              <div class="coupon-row">
                <input type="text" class="coupon-input"
                  id="coupon-input"
                  placeholder="Enter coupon code"
                  value="${window.appliedCoupon || ''}"
                  onkeydown="if(event.key==='Enter') applyCoupon()"/>
                <button class="apply-btn" onclick="applyCoupon()">Apply</button>
              </div>
              <div id="coupon-msg" class="${window.appliedCoupon ? 'coupon-msg success' : ''}">
                ${window.appliedCoupon ? '✅ SAVE100 applied! ₹100 off' : ''}
              </div>
              <div style="font-size:.78rem;color:var(--text3);margin-top:.4rem">
                💡 Use <strong>SAVE100</strong> on orders above ₹499
              </div>
            </div>

            <button class="checkout-btn" onclick="proceedToPayment()">
              Proceed to Payment →
            </button>
          </div>
        </div>

      </div>
    </div>`;

  updateOrderSummary();
}


// ════════════════════════════════
//  RENDER ONE CART ITEM
//  FIXED: uses _id for all button calls
// ════════════════════════════════
function renderCartItem(item) {
  // Use _id (MongoDB) or id (fallback)
  const id = item._id || item.id;

  // Show image if available, else emoji
  const imgHTML = item.image
    ? `<img src="${item.image}" alt="${item.name}"
         style="width:56px;height:56px;object-fit:cover;
                border-radius:8px;border:1px solid var(--border)"
         onerror="this.style.display='none';this.nextElementSibling.style.display='block'"/>
       <span style="display:none;font-size:2rem">${item.emoji || '📦'}</span>`
    : `<span style="font-size:2.5rem">${item.emoji || '📦'}</span>`;

  return `
    <div class="cart-item">
      <div class="cart-item-emoji">${imgHTML}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
        <div class="cart-item-unit">₹${item.price.toLocaleString()} each</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty('${id}', -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${id}', +1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeFromCart('${id}')">🗑️</button>
    </div>`;
}


// ════════════════════════════════
//  PROCEED TO PAYMENT
// ════════════════════════════════
function proceedToPayment() {
  if (window.cart.length === 0) {
    toast('⚠️', 'Your cart is empty!');
    return;
  }
  const total = getTotal();
  renderPaymentPage(total);
  showPage('payment');
}


// ════════════════════════════════
//  UPDATE CART BADGE COUNT
// ════════════════════════════════
function updateCartCount() {
  const count = window.cart.reduce(function(sum, i) { return sum + i.qty; }, 0);
  document.querySelectorAll('.cart-count').forEach(function(el) {
    el.textContent = count;
  });
}


// ════════════════════════════════
//  EXPOSE GLOBALLY
// ════════════════════════════════
window.addToCart          = addToCart;
window.removeFromCart     = removeFromCart;
window.changeQty          = changeQty;
window.applyCoupon        = applyCoupon;
window.renderCart         = renderCart;
window.proceedToPayment   = proceedToPayment;
window.getCartSubtotal    = getCartSubtotal;
window.getDiscount        = getDiscount;
window.getDelivery        = getDelivery;
window.getTotal           = getTotal;
window.updateOrderSummary = updateOrderSummary;
window.updateCartCount    = updateCartCount;

console.log('🛒 cart.js loaded');