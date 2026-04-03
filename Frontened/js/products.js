/*
  FILE: frontend/js/products.js — FIXED

  BUGS FIXED:

  BUG 1: apiGetProducts() does not exist
  FIX:   use apiFetchProducts() from api.js

  BUG 2: apiGetProduct(id) does not exist
  FIX:   use apiFetchProductById(id) from api.js

  BUG 3: onclick="showProductDetail(${product._id})"
  MongoDB _id is a STRING like "6712abc3f..."
  Passing it without quotes breaks the onclick call
  FIX:   onclick="showProductDetail('${product._id}')"

  BUG 4: onclick="addToCart(${product._id}, this)"
  Same issue — _id needs quotes
  FIX:   onclick="addToCart('${product._id}', this)"
*/


// ════════════════════════════════
//  RENDER PRODUCT GRID
// ════════════════════════════════
async function renderProducts(productsList) {

  const page = document.getElementById('page-shop');

  // Save navbar before overwriting page
  const navbar    = page.querySelector('.navbar');
  const navbarHTML = navbar ? navbar.outerHTML : '';

  // Show loading state first
  const existingGrid = document.getElementById('products-grid');
  if (existingGrid) {
    existingGrid.innerHTML = '<p style="color:var(--text2);padding:1rem">Loading...</p>';
  }

  // If products were passed in (e.g. from search), use them
  // Otherwise fetch fresh from backend
  let products = productsList;
  if (!products) {
    try {
      // BUG 1 FIX: was apiGetProducts() — does not exist
      // CORRECT function name is apiFetchProducts()
      products = await apiFetchProducts();
    } catch (error) {
      page.innerHTML = navbarHTML + `
        <div class="products-section">
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <div class="empty-title">Could not load products</div>
            <p style="color:var(--accent2)">${error.message}</p>
            <p style="font-size:.85rem;color:var(--text3);margin-top:.5rem">
              Make sure backend is running: node server.js
            </p>
            <button class="btn-primary"
              style="width:auto;padding:.6rem 1.5rem;margin-top:1rem"
              onclick="renderProducts()">
              Try Again
            </button>
          </div>
        </div>`;
      renderShopNavbar();
      return;
    }
  }

  const cart = window.cart || [];

  // If grid already exists just update its contents
  const grid = document.getElementById('products-grid');
  if (grid) {
    grid.innerHTML = products.length === 0
      ? `<div class="empty-state">
           <div class="empty-icon">🔍</div>
           <div class="empty-title">No products found</div>
         </div>`
      : products.map(function(p) { return renderProductCard(p, cart); }).join('');
    return;
  }

  // First load — build the full page
  page.innerHTML = navbarHTML + `
    <div class="hero">
      <div class="hero-badge">✦ New Arrivals 2026</div>
      <h1>Shop the Future<br><span>of Commerce</span></h1>
      <p class="hero-desc">Discover premium products curated just for you.</p>
    </div>

    <div class="products-section">
      <div class="section-title">Featured Products</div>
      <p class="section-sub">Handpicked just for you</p>
      <div class="products-grid" id="products-grid">
        ${products.length === 0
          ? `<div class="empty-state">
               <div class="empty-icon">📦</div>
               <div class="empty-title">No products yet</div>
               <p>Login as admin to add products</p>
             </div>`
          : products.map(function(p) { return renderProductCard(p, cart); }).join('')
        }
      </div>
    </div>

    <footer>© 2026 EassYBuY — Built with ♥</footer>`;

  renderShopNavbar();
}


// ════════════════════════════════
//  RENDER ONE PRODUCT CARD
// ════════════════════════════════
function renderProductCard(product, cart) {

  // Use _id (MongoDB) for all comparisons
  const id       = product._id;
  const inCart   = cart.some(function(c) { return String(c._id) === String(id); });
  const lowStock = product.stock <= 10;
  const discount = product.origPrice
    ? Math.round((1 - product.price / product.origPrice) * 100)
    : 0;

  // Image: show real image if path exists, else show emoji
  const imgContent = product.image
    ? `<img
         src="${product.image}"
         alt="${product.name}"
         style="width:100%;height:100%;object-fit:cover"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
       />
       <span style="display:none;font-size:4.5rem;width:100%;height:100%;
         align-items:center;justify-content:center">
         ${product.emoji || '📦'}
       </span>`
    : `<span style="font-size:4.5rem">${product.emoji || '📦'}</span>`;

  return `
    <div class="product-card"
      onmousemove="tilt3D(event, this)"
      onmouseleave="resetTilt(this)"
      onclick="showProductDetail('${id}')">

      ${lowStock ? '<div class="product-badge">⚡ Low Stock</div>' : ''}

      <div class="product-img">${imgContent}</div>

      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>

        <div>
          <span class="product-price">₹${product.price.toLocaleString()}</span>
          ${product.origPrice
            ? `<span class="product-price-orig">₹${product.origPrice.toLocaleString()}</span>`
            : ''}
          ${discount > 0
            ? `<span class="product-discount-badge">${discount}% OFF</span>`
            : ''}
        </div>

        <div class="product-rating">
          ${renderStars(product.rating)} ${product.rating}
        </div>

        <button
          class="add-to-cart-btn ${inCart ? 'added' : ''}"
          id="cart-btn-${id}"
          onclick="event.stopPropagation(); addToCart('${id}', this)">
          ${inCart ? '✓ Added to Cart' : 'Add to Cart 🛒'}
        </button>
      </div>
    </div>`;
}


// ════════════════════════════════
//  STAR RATING
// ════════════════════════════════
function renderStars(rating) {
  var r     = rating || 0;
  var full  = Math.floor(r);
  var empty = 5 - Math.ceil(r);
  return '★'.repeat(full) + '☆'.repeat(empty);
}


// ════════════════════════════════
//  PRODUCT DETAIL PAGE
// ════════════════════════════════
async function showProductDetail(id) {

  const page      = document.getElementById('page-product');
  const shopNavbar = document.getElementById('page-shop').querySelector('.navbar');
  const navbarHTML = shopNavbar ? shopNavbar.outerHTML : '';

  // Show loading while fetching
  page.innerHTML = navbarHTML + `
    <div class="product-detail-page">
      <button class="back-btn" onclick="showPage('shop')">← Back</button>
      <p style="color:var(--text2);padding:2rem">Loading product...</p>
    </div>`;
  showPage('product');

  try {
    // BUG 2 FIX: was apiGetProduct(id) — does not exist
    // CORRECT function name is apiFetchProductById(id)
    const product  = await apiFetchProductById(id);
    const cart     = window.cart || [];
    const inCart   = cart.some(function(c) { return String(c._id) === String(id); });
    const discount = product.origPrice
      ? Math.round((1 - product.price / product.origPrice) * 100)
      : 0;

    const imgContent = product.image
      ? `<img
           src="${product.image}"
           alt="${product.name}"
           style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-lg)"
           onerror="this.style.display='none';this.nextElementSibling.style.display='block'"
         />
         <span style="display:none;font-size:7rem">${product.emoji || '📦'}</span>`
      : `<span style="font-size:7rem">${product.emoji || '📦'}</span>`;

    page.innerHTML = navbarHTML + `
      <div class="product-detail-page">
        <button class="back-btn" onclick="showPage('shop')">← Back to Products</button>

        <div class="product-detail-layout">

          <div class="product-detail-img">${imgContent}</div>

          <div>
            <div class="product-category" style="margin-bottom:.5rem">
              ${product.category}
            </div>
            <h2 style="font-size:2rem;margin-bottom:1rem">${product.name}</h2>

            <div style="margin-bottom:1rem;display:flex;align-items:center;
              flex-wrap:wrap;gap:.5rem">
              <span class="product-price" style="font-size:2rem">
                ₹${product.price.toLocaleString()}
              </span>
              ${product.origPrice
                ? `<span class="product-price-orig" style="font-size:1rem">
                     ₹${product.origPrice.toLocaleString()}
                   </span>`
                : ''}
              ${discount > 0
                ? `<span class="product-discount-badge" style="font-size:.9rem">
                     ${discount}% OFF
                   </span>`
                : ''}
            </div>

            <div class="product-rating" style="font-size:1rem;margin-bottom:1rem">
              ${renderStars(product.rating)} ${product.rating} / 5
            </div>

            <p style="color:var(--text2);line-height:1.7;margin-bottom:1.5rem">
              ${product.desc || ''}
            </p>

            <div style="margin-bottom:1.5rem">
              ${(product.tags || []).map(function(tag) {
                return '<span class="product-tag">' + tag + '</span>';
              }).join('')}
            </div>

            <div style="color:var(--text3);font-size:.85rem;margin-bottom:1.5rem">
              📦 ${product.stock} in stock &nbsp;|&nbsp;
              🚚 ${product.price >= 499 ? 'Free Delivery' : 'Delivery ₹49'}
            </div>

            <button
              class="add-to-cart-btn ${inCart ? 'added' : ''}"
              id="detail-cart-btn-${id}"
              style="max-width:280px;padding:.8rem 2rem;font-size:1rem"
              onclick="addToCart('${id}', this)">
              ${inCart ? '✓ Added to Cart' : 'Add to Cart 🛒'}
            </button>
          </div>

        </div>
      </div>`;

  } catch (error) {
    toast('❌', 'Could not load product: ' + error.message);
    showPage('shop');
  }
}


// ════════════════════════════════
//  SEARCH PRODUCTS
// ════════════════════════════════
async function searchProducts() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();

  try {
    // BUG 1 FIX: was apiGetProducts() — does not exist
    const products = await apiFetchProducts();

    const filtered = products.filter(function(p) {
      return p.name.toLowerCase().includes(query) ||
             p.category.toLowerCase().includes(query);
    });

    renderProducts(filtered);

  } catch (error) {
    toast('❌', 'Search failed: ' + error.message);
  }
}


// ════════════════════════════════
//  3D TILT EFFECT
// ════════════════════════════════
function tilt3D(event, element) {
  var rect = element.getBoundingClientRect();
  var x    = (event.clientX - rect.left) / rect.width  - 0.5;
  var y    = (event.clientY - rect.top)  / rect.height - 0.5;
  element.style.transform  = 'translateY(-6px) rotateY(' + (x*15) + 'deg) rotateX(' + (-y*10) + 'deg)';
  element.style.transition = 'transform 0.1s ease';
}

function resetTilt(element) {
  element.style.transform  = '';
  element.style.transition = 'transform 0.4s ease';
}


// ════════════════════════════════
//  EXPOSE GLOBALLY
// ════════════════════════════════
window.renderProducts    = renderProducts;
window.renderProductCard = renderProductCard;
window.showProductDetail = showProductDetail;
window.searchProducts    = searchProducts;
window.renderStars       = renderStars;
window.tilt3D            = tilt3D;
window.resetTilt         = resetTilt;

console.log('🛍️ products.js loaded');