/*
  FILE: frontend/js/payment.js — FIXED

  BUG: Only COD asked for delivery address
  All payment methods should collect address + phone
  
  FIX: Added a common delivery address section
  that appears for ALL payment methods at the top
  of the payment form before the payment details
*/

window.selectedPayment = 'upi';


// ════════════════════════════════
//  RENDER PAYMENT PAGE
// ════════════════════════════════
function renderPaymentPage(total) {

  document.getElementById('page-payment').innerHTML = `
    <nav class="navbar">
      <div class="nav-logo">EassYBuY ✦</div>
      <div class="nav-links">
        <button class="nav-btn" onclick="showPage('cart')">← Back to Cart</button>
      </div>
    </nav>

    <div class="payment-page">
      <div class="payment-card">

        <div class="payment-title">Complete Your Payment</div>
        <div class="payment-amount">₹${total.toLocaleString()}</div>

        <!-- ══════════════════════════════════════ -->
        <!-- DELIVERY ADDRESS — shown for ALL methods -->
        <!-- ══════════════════════════════════════ -->
        <div style="background:rgba(108,99,255,.08);border:1px solid rgba(108,99,255,.25);
          border-radius:12px;padding:1.2rem;margin-bottom:1.5rem">

          <div style="font-weight:600;font-size:.95rem;margin-bottom:1rem;
            display:flex;align-items:center;gap:.5rem">
            📍 Delivery Address
          </div>

          <div class="form-group" style="margin-bottom:.8rem">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="delivery-name"
              placeholder="Enter your full name"
              value="${window.currentUser ? window.currentUser.name : ''}"/>
          </div>

          <div class="form-group" style="margin-bottom:.8rem">
            <label class="form-label">Mobile Number *</label>
            <input type="tel" class="form-input" id="delivery-phone"
              placeholder="+91 98765 43210" maxlength="13"/>
          </div>

          <div class="form-group" style="margin-bottom:.8rem">
            <label class="form-label">House / Flat No & Street *</label>
            <input type="text" class="form-input" id="delivery-street"
              placeholder="e.g. Flat 4B, MG Road"/>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-bottom:.8rem">
            <div class="form-group" style="margin:0">
              <label class="form-label">City *</label>
              <input type="text" class="form-input" id="delivery-city"
                placeholder="e.g. Chennai"/>
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label">State</label>
              <input type="text" class="form-input" id="delivery-state"
                placeholder="e.g. Tamil Nadu"/>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem">
            <div class="form-group" style="margin:0">
              <label class="form-label">PIN Code *</label>
              <input type="text" class="form-input" id="delivery-pin"
                placeholder="e.g. 600001" maxlength="6"/>
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label">Landmark</label>
              <input type="text" class="form-input" id="delivery-landmark"
                placeholder="Near bus stop (optional)"/>
            </div>
          </div>

        </div>

        <!-- ══════════════════════════════════════ -->
        <!-- PAYMENT METHOD SELECTION              -->
        <!-- ══════════════════════════════════════ -->
        <div style="font-weight:600;color:var(--text2);margin-bottom:1rem">
          Choose Payment Method
        </div>

        <div class="payment-methods">
          <div class="payment-method selected" id="pm-upi"
            onclick="selectPaymentMethod('upi')">
            <div class="pm-icon">📱</div>
            <div><div class="pm-label">UPI</div>
            <div class="pm-sub">GPay, PhonePe, Paytm, BHIM</div></div>
          </div>
          <div class="payment-method" id="pm-card"
            onclick="selectPaymentMethod('card')">
            <div class="pm-icon">💳</div>
            <div><div class="pm-label">Credit / Debit Card</div>
            <div class="pm-sub">Visa, Mastercard, RuPay</div></div>
          </div>
          <div class="payment-method" id="pm-netbanking"
            onclick="selectPaymentMethod('netbanking')">
            <div class="pm-icon">🏦</div>
            <div><div class="pm-label">Net Banking</div>
            <div class="pm-sub">All major Indian banks</div></div>
          </div>
          <div class="payment-method" id="pm-cod"
            onclick="selectPaymentMethod('cod')">
            <div class="pm-icon">🏠</div>
            <div><div class="pm-label">Pay on Delivery</div>
            <div class="pm-sub">Cash or UPI at doorstep</div></div>
          </div>
        </div>

        <!-- UPI FORM -->
        <div id="payment-form-upi" class="payment-form">
          <div class="form-group">
            <label class="form-label">UPI ID *</label>
            <input type="text" class="form-input" id="upi-id"
              placeholder="yourname@okicici"/>
          </div>
          <button class="btn-primary" onclick="processPayment(${total})">
            Pay ₹${total.toLocaleString()} 🔒
          </button>
        </div>

        <!-- CARD FORM -->
        <div id="payment-form-card" class="payment-form" style="display:none">
          <div class="card-visual">
            <div class="card-bank">EASSYBUY BANK</div>
            <div class="card-number-display" id="card-num-preview">•••• •••• •••• ••••</div>
            <div class="card-details-row">
              <div>
                <div class="card-field-label">CARDHOLDER</div>
                <div id="card-name-preview">YOUR NAME</div>
              </div>
              <div>
                <div class="card-field-label">EXPIRY</div>
                <div id="card-exp-preview">MM/YY</div>
              </div>
            </div>
          </div>
          <div class="card-inputs">
            <div class="form-group full-width">
              <label class="form-label">Card Number</label>
              <input type="text" class="form-input" id="card-number"
                placeholder="1234 5678 9012 3456" maxlength="19"
                oninput="formatCardNumber(this)"/>
            </div>
            <div class="form-group full-width">
              <label class="form-label">Cardholder Name</label>
              <input type="text" class="form-input" id="card-name"
                placeholder="John Doe"
                oninput="document.getElementById('card-name-preview').textContent=this.value.toUpperCase()||'YOUR NAME'"/>
            </div>
            <div class="form-group">
              <label class="form-label">Expiry (MM/YY)</label>
              <input type="text" class="form-input" id="card-exp"
                placeholder="12/27" maxlength="5"
                oninput="document.getElementById('card-exp-preview').textContent=this.value||'MM/YY'"/>
            </div>
            <div class="form-group">
              <label class="form-label">CVV</label>
              <input type="password" class="form-input" id="card-cvv"
                placeholder="•••" maxlength="4"/>
            </div>
          </div>
          <button class="btn-primary" onclick="processPayment(${total})">
            Pay Securely ₹${total.toLocaleString()} 🔒
          </button>
        </div>

        <!-- NET BANKING FORM -->
        <div id="payment-form-netbanking" class="payment-form" style="display:none">
          <div class="form-group">
            <label class="form-label">Select Your Bank</label>
            <select class="bank-select" id="bank-select">
              <option value="">-- Choose your bank --</option>
              <option>State Bank of India (SBI)</option>
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
              <option>Kotak Mahindra Bank</option>
              <option>Punjab National Bank</option>
              <option>Bank of Baroda</option>
              <option>Canara Bank</option>
            </select>
          </div>
          <button class="btn-primary" onclick="processPayment(${total})">
            Continue to Bank →
          </button>
        </div>

        <!-- COD FORM -->
        <div id="payment-form-cod" class="payment-form" style="display:none">
          <div class="cod-notice">
            <div class="cod-notice-title">📦 Pay on Delivery</div>
            <div class="cod-notice-desc">
              Keep exact amount ready at doorstep. Cash or UPI accepted.
            </div>
          </div>
          <button class="btn-primary" onclick="processPayment(${total})">
            Place Order (Pay on Delivery) 📦
          </button>
        </div>

      </div>
    </div>`;

  window.selectedPayment = 'upi';
}


// ════════════════════════════════
//  SELECT PAYMENT METHOD
// ════════════════════════════════
function selectPaymentMethod(method) {
  window.selectedPayment = method;
  ['upi','card','netbanking','cod'].forEach(function(m) {
    document.getElementById('pm-'+m).classList.toggle('selected', m===method);
    var form = document.getElementById('payment-form-'+m);
    if (form) form.style.display = m===method ? 'block' : 'none';
  });
}


// ════════════════════════════════
//  FORMAT CARD NUMBER
// ════════════════════════════════
function formatCardNumber(input) {
  var val = input.value.replace(/\D/g,'').substring(0,16);
  val = val.replace(/(.{4})/g,'$1 ').trim();
  input.value = val;
  var preview = document.getElementById('card-num-preview');
  if (preview) preview.textContent = val || '•••• •••• •••• ••••';
}


// ════════════════════════════════
//  VALIDATE DELIVERY ADDRESS
//  Called before processing payment
// ════════════════════════════════
function validateDeliveryAddress() {
  var phone  = document.getElementById('delivery-phone').value.trim();
  var street = document.getElementById('delivery-street').value.trim();
  var city   = document.getElementById('delivery-city').value.trim();
  var pin    = document.getElementById('delivery-pin').value.trim();

  if (!phone)  { toast('⚠️', 'Please enter your mobile number');    return false; }
  if (!street) { toast('⚠️', 'Please enter your street address');   return false; }
  if (!city)   { toast('⚠️', 'Please enter your city');             return false; }
  if (!pin || pin.length < 6) { toast('⚠️', 'Please enter valid 6-digit PIN code'); return false; }

  return true;
}


// ════════════════════════════════
//  BUILD FULL ADDRESS STRING
// ════════════════════════════════
function getFullAddress() {
  var name     = document.getElementById('delivery-name').value.trim();
  var phone    = document.getElementById('delivery-phone').value.trim();
  var street   = document.getElementById('delivery-street').value.trim();
  var city     = document.getElementById('delivery-city').value.trim();
  var state    = document.getElementById('delivery-state').value.trim();
  var pin      = document.getElementById('delivery-pin').value.trim();
  var landmark = document.getElementById('delivery-landmark').value.trim();

  var parts = [name, street];
  if (landmark) parts.push('Near ' + landmark);
  parts.push(city);
  if (state) parts.push(state);
  parts.push('PIN: ' + pin);
  parts.push('📱 ' + phone);

  return parts.filter(Boolean).join(', ');
}


// ════════════════════════════════
//  PROCESS PAYMENT
// ════════════════════════════════
async function processPayment(total) {
  var method = window.selectedPayment;

  // ── Step 1: Validate delivery address first ──
  if (!validateDeliveryAddress()) return;

  // ── Step 2: Validate payment method details ──
  if (method === 'upi') {
    var upiId = document.getElementById('upi-id').value.trim();
    if (!upiId || !upiId.includes('@')) {
      toast('❌', 'Enter a valid UPI ID (e.g. name@upi)');
      return;
    }
  }
  else if (method === 'card') {
    var num  = document.getElementById('card-number').value.replace(/\s/g,'');
    var name = document.getElementById('card-name').value.trim();
    var exp  = document.getElementById('card-exp').value.trim();
    var cvv  = document.getElementById('card-cvv').value.trim();
    if (num.length < 16)               { toast('❌','Enter valid 16-digit card number'); return; }
    if (!name)                         { toast('❌','Enter cardholder name');            return; }
    if (!exp.match(/^\d{2}\/\d{2}$/)) { toast('❌','Enter expiry as MM/YY');            return; }
    if (cvv.length < 3)               { toast('❌','Enter valid CVV');                  return; }
  }
  else if (method === 'netbanking') {
    if (!document.getElementById('bank-select').value) {
      toast('❌','Please select your bank'); return;
    }
  }

  // ── Step 3: Disable pay button ──
  var btns = document.querySelectorAll('.payment-form .btn-primary');
  btns.forEach(function(b) { b.disabled=true; b.textContent='Processing...'; });

  try {
    // ── Step 4: Send order to backend ──
    var result = await apiCreateOrder({
      items: window.cart.map(function(item) {
        return {
          productId: item._id || item.id,
          name:      item.name,
          emoji:     item.emoji  || '',
          image:     item.image  || '',
          price:     item.price,
          qty:       item.qty
        };
      }),
      subtotal:       getCartSubtotal(),
      discount:       getDiscount(),
      deliveryCharge: getDelivery(),
      total:          total || getTotal(),
      paymentMethod:  method,
      coupon:         window.appliedCoupon || '',
      // Save delivery address with the order
      deliveryAddress: getFullAddress()
    });

    // ── Step 5: Clear cart ──
    window.cart          = [];
    window.appliedCoupon = null;
    updateCartCount();

    renderSuccessPage(result.orderId);
    showPage('success');
    toast('🎉', 'Order placed successfully!');

  } catch (err) {
    toast('❌', err.message || 'Payment failed. Try again.');
    btns.forEach(function(b) { b.disabled=false; b.textContent='Pay Now 🔒'; });
  }
}


// ════════════════════════════════
//  SUCCESS PAGE
// ════════════════════════════════
function renderSuccessPage(orderId) {
  document.getElementById('page-success').innerHTML = `
    <div class="success-page">
      <div class="success-card">
        <span class="success-icon">🎉</span>
        <h2 class="success-title">Order Placed!</h2>
        <p style="color:var(--text2);margin-bottom:1rem">
          Your order is confirmed. We'll deliver it soon!
        </p>
        <div class="success-order-id">
          🎫 Order #${String(orderId).slice(-8).toUpperCase()}
        </div>
        <p style="font-size:.78rem;color:var(--text3);margin-bottom:1.5rem">
          Full ID: ${orderId}
        </p>
        <button class="btn-primary" style="margin-bottom:.8rem"
          onclick="showPage('orders')">Track My Order 📦</button>
        <br>
        <button class="btn-cancel" style="width:100%;margin-top:.5rem"
          onclick="showPage('shop')">Continue Shopping →</button>
      </div>
    </div>`;
}


// ════════════════════════════════
//  EXPOSE GLOBALLY
// ════════════════════════════════
window.renderPaymentPage   = renderPaymentPage;
window.selectPaymentMethod = selectPaymentMethod;
window.formatCardNumber    = formatCardNumber;
window.processPayment      = processPayment;
window.renderSuccessPage   = renderSuccessPage;

console.log('💳 payment.js loaded');