/*
  FILE: frontend/js/admin.js — FIXED
  Added: Full orders list view for admin
  Admin can now see all orders with user details and items
*/

let editingProductId = null;
let adminCurrentView = 'products'; // 'products' or 'orders'


// ════════════════════════════════
//  RENDER ADMIN DASHBOARD
// ════════════════════════════════
async function renderAdminDashboard() {

  const page   = document.getElementById('page-admin');
  const navbar = page.querySelector('.navbar');
  const navHTML = navbar ? navbar.outerHTML : '';

  page.innerHTML = navHTML + `
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <div class="admin-title">🛠️ Admin Dashboard</div>
          <div class="admin-subtitle">Manage your store inventory and orders</div>
        </div>
        <button class="add-product-btn" onclick="openAddProductModal()">
          + Add New Product
        </button>
      </div>

      <!-- STATS -->
      <div class="admin-stats" id="admin-stats-area">
        <p style="color:var(--text2)">Loading...</p>
      </div>

      <!-- TAB BUTTONS -->
      <div style="display:flex;gap:.8rem;margin-bottom:1.5rem">
        <button id="tab-products-btn"
          onclick="showAdminTab('products')"
          style="padding:.55rem 1.4rem;border-radius:8px;border:1px solid var(--border);
                 background:var(--accent);color:#fff;font-family:'Satoshi',sans-serif;
                 font-weight:600;cursor:pointer;font-size:.9rem">
          📦 Products
        </button>
        <button id="tab-orders-btn"
          onclick="showAdminTab('orders')"
          style="padding:.55rem 1.4rem;border-radius:8px;border:1px solid var(--border);
                 background:var(--bg3);color:var(--text2);font-family:'Satoshi',sans-serif;
                 font-weight:600;cursor:pointer;font-size:.9rem">
          🛒 Orders
        </button>
      </div>

      <!-- CONTENT AREA -->
      <div id="admin-content-area">
        <p style="color:var(--text2)">Loading...</p>
      </div>

    </div>`;

  renderAdminNavbar();
  await loadAdminStats();
  showAdminTab('products');
}


// ════════════════════════════════
//  LOAD STATS
// ════════════════════════════════
async function loadAdminStats() {
  try {
    const products = await apiFetchProducts();
    let orders = [];
    try { orders = await apiGetAllOrders(); } catch(e) { orders = []; }

    const revenue  = orders.reduce(function(s,o){ return s + (o.total||0); }, 0);
    const lowStock = products.filter(function(p){ return p.stock <= 10; }).length;

    document.getElementById('admin-stats-area').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div><div class="stat-value">${products.length}</div>
        <div class="stat-label">Total Products</div></div>
      </div>
      <div class="stat-card" onclick="showAdminTab('orders')"
        style="cursor:pointer">
        <div class="stat-icon">🛒</div>
        <div><div class="stat-value">${orders.length}</div>
        <div class="stat-label">Total Orders</div></div>
      </div>
      <div class="stat-card" onclick="showRevenueBreakdown()"
        style="cursor:pointer" title="Click to see revenue breakdown">
        <div class="stat-icon">💰</div>
        <div>
          <div class="stat-value">₹${revenue.toLocaleString()}</div>
          <div class="stat-label">Total Revenue</div>
          <div style="font-size:.72rem;color:var(--accent);margin-top:2px">
            Click to view breakdown →
          </div>
        </div>
      </div>
      <div class="stat-card" onclick="showLowStockProducts()"
        style="cursor:pointer" title="Click to see low stock products">
        <div class="stat-icon">⚠️</div>
        <div>
          <div class="stat-value" style="color:var(--accent2)">${lowStock}</div>
          <div class="stat-label">Low Stock Items</div>
          <div style="font-size:.72rem;color:var(--accent);margin-top:2px">
            ${lowStock > 0 ? 'Click to view →' : 'All good ✅'}
          </div>
        </div>
      </div>`;
  } catch(e) {
    console.error('Stats error:', e.message);
  }
}


// ════════════════════════════════
//  SWITCH BETWEEN PRODUCTS / ORDERS TAB
// ════════════════════════════════
async function showAdminTab(tab) {
  adminCurrentView = tab;

  // Update tab button styles
  const prodBtn  = document.getElementById('tab-products-btn');
  const ordBtn   = document.getElementById('tab-orders-btn');
  if (prodBtn && ordBtn) {
    prodBtn.style.background = tab === 'products' ? 'var(--accent)' : 'var(--bg3)';
    prodBtn.style.color      = tab === 'products' ? '#fff'          : 'var(--text2)';
    ordBtn.style.background  = tab === 'orders'   ? 'var(--accent)' : 'var(--bg3)';
    ordBtn.style.color       = tab === 'orders'   ? '#fff'          : 'var(--text2)';
  }

  if (tab === 'products') {
    await loadProductsTab();
  } else {
    await loadOrdersTab();
  }
}


// ════════════════════════════════
//  PRODUCTS TAB
// ════════════════════════════════
async function loadProductsTab() {
  const area = document.getElementById('admin-content-area');
  area.innerHTML = '<p style="color:var(--text2);padding:1rem">Loading products...</p>';

  try {
    const products = await apiFetchProducts();

    area.innerHTML = `
      <div class="admin-products-table">
        <div class="table-header">
          <div class="table-title">All Products</div>
          <div class="table-count">${products.length} products total</div>
        </div>
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Orig. Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>${renderAdminTableRows(products)}</tbody>
          </table>
        </div>
      </div>`;
  } catch(e) {
    area.innerHTML = `<p style="color:var(--accent2);padding:1rem">Error: ${e.message}</p>`;
  }
}


// ════════════════════════════════
//  ORDERS TAB — shows all user orders
// ════════════════════════════════
async function loadOrdersTab() {
  const area = document.getElementById('admin-content-area');
  area.innerHTML = '<p style="color:var(--text2);padding:1rem">Loading orders...</p>';

  try {
    const orders = await apiGetAllOrders();

    if (!orders || orders.length === 0) {
      area.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <div class="empty-title">No orders yet</div>
          <p>Orders will appear here once users place them</p>
        </div>`;
      return;
    }

    // Build orders table
    area.innerHTML = `
      <div class="admin-products-table">
        <div class="table-header">
          <div class="table-title">All Orders</div>
          <div class="table-count">${orders.length} orders total</div>
        </div>
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${[...orders].reverse().map(function(order) {

                // Customer info — .populate() adds user name+email
                const userName  = order.user && order.user.name  ? order.user.name  : 'Unknown';
                const userEmail = order.user && order.user.email ? order.user.email : '';

                // Short order ID — last 8 chars
                const shortId = String(order._id).slice(-8).toUpperCase();

                // Items list
                const itemsList = (order.items || []).map(function(item) {
                  return `<span style="display:inline-block;background:var(--bg3);
                    border:1px solid var(--border);border-radius:5px;
                    padding:2px 6px;font-size:.75rem;margin:1px">
                    ${item.emoji || '📦'} ${item.name} ×${item.qty}
                  </span>`;
                }).join(' ');

                // Payment badge
                const payIcons = { upi:'📱', card:'💳', netbanking:'🏦', cod:'🏠' };
                const payLabel = (payIcons[order.paymentMethod] || '💰') + ' ' +
                  (order.paymentMethod || '').toUpperCase();

                // Status badge color
                const statusColors = {
                  processing:       '#ffb74d',
                  shipped:          'var(--accent)',
                  out_for_delivery: 'var(--accent2)',
                  delivered:        'var(--accent3)'
                };
                const statusColor = statusColors[order.status] || '#ffb74d';

                // Date
                const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day:'numeric', month:'short', year:'numeric'
                });

                return `
                  <tr>
                    <td style="font-family:monospace;font-size:.82rem;color:var(--accent)">
                      #${shortId}
                    </td>
                    <td>
                      <div style="font-weight:600">${userName}</div>
                      <div style="font-size:.78rem;color:var(--text3)">${userEmail}</div>
                    </td>
                    <td style="max-width:200px">${itemsList}</td>
                    <td style="font-weight:700;color:var(--accent3)">
                      ₹${(order.total || 0).toLocaleString()}
                    </td>
                    <td style="font-size:.85rem">${payLabel}</td>
                    <td>
                      <span style="color:${statusColor};font-weight:600;
                        font-size:.82rem;text-transform:capitalize">
                        ${(order.status || 'processing').replace(/_/g,' ')}
                      </span>
                    </td>
                    <td style="font-size:.82rem;color:var(--text3)">${date}</td>
                  </tr>`;

              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

  } catch(e) {
    area.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <div class="empty-title">Could not load orders</div>
        <p style="color:var(--accent2)">${e.message}</p>
        <button class="btn-primary"
          style="width:auto;padding:.6rem 1.5rem;margin-top:1rem"
          onclick="loadOrdersTab()">Try Again</button>
      </div>`;
  }
}


// ════════════════════════════════
//  RENDER PRODUCT TABLE ROWS
// ════════════════════════════════
function renderAdminTableRows(products) {
  if (!products || products.length === 0) {
    return `<tr><td colspan="8"
      style="text-align:center;padding:2rem;color:var(--text3)">
      No products yet. Click "+ Add New Product".
    </td></tr>`;
  }

  return products.map(function(p) {
    var imgCell = p.image
      ? `<img src="${p.image}" alt="${p.name}"
           style="width:48px;height:48px;object-fit:cover;
                  border-radius:8px;border:1px solid var(--border)"
           onerror="this.style.display='none';this.nextElementSibling.style.display='block'"/>
         <span style="display:none;font-size:1.8rem">${p.emoji||'📦'}</span>`
      : `<span style="font-size:1.8rem">${p.emoji||'📦'}</span>`;

    var stockColor = p.stock <= 10 ? 'var(--accent2)' : 'var(--accent3)';
    var stockLabel = p.stock <= 10 ? '⚠️ '+p.stock : p.stock;

    return `
      <tr>
        <td>${imgCell}</td>
        <td style="font-weight:600">${p.name}</td>
        <td>${p.category}</td>
        <td style="color:var(--accent);font-weight:700">₹${p.price.toLocaleString()}</td>
        <td style="color:var(--text3);text-decoration:line-through">
          ₹${(p.origPrice||p.price).toLocaleString()}
        </td>
        <td style="color:${stockColor};font-weight:600">${stockLabel}</td>
        <td>⭐ ${p.rating}</td>
        <td>
          <button class="edit-btn" onclick="openEditProductModal('${p._id}')">✏️ Edit</button>
          <button class="del-btn"  onclick="confirmDeleteProduct('${p._id}','${p.name}')">🗑️</button>
        </td>
      </tr>`;
  }).join('');
}


// ════════════════════════════════
//  ADD PRODUCT MODAL
// ════════════════════════════════
function openAddProductModal() {
  editingProductId = null;
  document.getElementById('modal-box').innerHTML = `
    <div class="modal-title">➕ Add New Product</div>
    ${renderProductForm(null)}
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModalDirect()">Cancel</button>
      <button class="btn-save" onclick="saveProduct()">Save Product</button>
    </div>`;
  openModal();
}


// ════════════════════════════════
//  EDIT PRODUCT MODAL
// ════════════════════════════════
async function openEditProductModal(id) {
  editingProductId = id;
  try {
    const p = await apiFetchProductById(id);
    document.getElementById('modal-box').innerHTML = `
      <div class="modal-title">✏️ Edit Product</div>
      ${renderProductForm(p)}
      <div class="modal-actions">
        <button class="btn-cancel" onclick="closeModalDirect()">Cancel</button>
        <button class="btn-save" onclick="saveProduct()">Update Product</button>
      </div>`;
    openModal();
  } catch(e) {
    toast('❌', 'Could not load product: ' + e.message);
  }
}


// ════════════════════════════════
//  PRODUCT FORM
// ════════════════════════════════
function renderProductForm(p) {
  var v = function(f, d) { return p ? (p[f] !== undefined ? p[f] : (d||'')) : (d||''); };
  return `
    <div class="form-group">
      <label class="form-label">Image Path
        <span style="color:var(--text3);font-weight:400">(e.g. assets/products/image.jpg)</span>
      </label>
      <input type="text" class="form-input" id="m-image"
        placeholder="assets/products/your-image.jpg"
        value="${v('image')}" oninput="previewAdminImage(this.value)"/>
      <div id="admin-img-preview" style="margin-top:8px">
        ${v('image') ? `<img src="${v('image')}"
          style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--border)"
          onerror="this.style.display='none'"/>` : ''}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Emoji (fallback)</label>
      <input type="text" class="form-input" id="m-emoji"
        placeholder="📦" value="${v('emoji')}" maxlength="4"/>
    </div>
    <div class="form-group">
      <label class="form-label">Product Name *</label>
      <input type="text" class="form-input" id="m-name"
        placeholder="e.g. Sony Headphones" value="${v('name')}"/>
    </div>
    <div class="form-group">
      <label class="form-label">Category *</label>
      <input type="text" class="form-input" id="m-category"
        placeholder="e.g. Electronics" value="${v('category')}"/>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div class="form-group">
        <label class="form-label">Sale Price (₹) *</label>
        <input type="number" class="form-input" id="m-price"
          placeholder="24999" value="${v('price')}" min="0"/>
      </div>
      <div class="form-group">
        <label class="form-label">Original Price (₹)</label>
        <input type="number" class="form-input" id="m-orig-price"
          placeholder="32000" value="${v('origPrice')}" min="0"/>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div class="form-group">
        <label class="form-label">Stock *</label>
        <input type="number" class="form-input" id="m-stock"
          placeholder="50" value="${v('stock')}" min="0"/>
      </div>
      <div class="form-group">
        <label class="form-label">Rating (1-5)</label>
        <input type="number" class="form-input" id="m-rating"
          placeholder="4.5" value="${v('rating')}" min="1" max="5" step="0.1"/>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-input" id="m-desc" rows="3"
        placeholder="Product description...">${v('desc')}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Tags (comma separated)</label>
      <input type="text" class="form-input" id="m-tags"
        placeholder="wireless, premium"
        value="${p ? (p.tags||[]).join(', ') : ''}"/>
    </div>`;
}


// ════════════════════════════════
//  IMAGE PREVIEW
// ════════════════════════════════
function previewAdminImage(path) {
  var el = document.getElementById('admin-img-preview');
  if (!el) return;
  el.innerHTML = path
    ? `<img src="${path}"
         style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--border)"
         onerror="this.style.display='none'" alt="Preview"/>`
    : '';
}


// ════════════════════════════════
//  SAVE PRODUCT
// ════════════════════════════════
async function saveProduct() {
  var name      = document.getElementById('m-name').value.trim();
  var emoji     = document.getElementById('m-emoji').value.trim() || '📦';
  var image     = document.getElementById('m-image').value.trim();
  var category  = document.getElementById('m-category').value.trim();
  var price     = parseInt(document.getElementById('m-price').value);
  var origPrice = parseInt(document.getElementById('m-orig-price').value) || price;
  var stock     = parseInt(document.getElementById('m-stock').value);
  var rating    = parseFloat(document.getElementById('m-rating').value) || 4.5;
  var desc      = document.getElementById('m-desc').value.trim();
  var tags      = document.getElementById('m-tags').value
    .split(',').map(function(t){ return t.trim(); }).filter(Boolean);

  if (!name)           { toast('⚠️', 'Product name is required'); return; }
  if (!category)       { toast('⚠️', 'Category is required');     return; }
  if (!price || price < 1) { toast('⚠️', 'Enter a valid price'); return; }

  var btn = document.querySelector('.btn-save');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    var data = { name,emoji,image,category,price,origPrice,stock,rating,desc,tags };
    if (editingProductId === null) {
      await apiAddProduct(data);
      toast('🎉', '"'+name+'" added!');
    } else {
      await apiUpdateProduct(editingProductId, data);
      toast('✅', '"'+name+'" updated!');
    }
    closeModalDirect();
    await loadAdminStats();
    showAdminTab('products');
  } catch(e) {
    toast('❌', e.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Save Product'; }
  }
}


// ════════════════════════════════
//  DELETE PRODUCT
// ════════════════════════════════
async function confirmDeleteProduct(id, name) {
  if (!confirm('Delete "'+name+'"?\nThis cannot be undone.')) return;
  try {
    await apiDeleteProduct(id);
    toast('🗑️', '"'+name+'" deleted');
    await loadAdminStats();
    showAdminTab('products');
  } catch(e) {
    toast('❌', e.message);
  }
}


// ════════════════════════════════
//  SHOW REVENUE BREAKDOWN
//  Shows which products sold,
//  how many units, and total money
// ════════════════════════════════
async function showRevenueBreakdown() {

  // Switch to products tab visually
  adminCurrentView = 'products';
  const prodBtn = document.getElementById('tab-products-btn');
  const ordBtn  = document.getElementById('tab-orders-btn');
  if (prodBtn) { prodBtn.style.background='var(--accent)'; prodBtn.style.color='#fff'; }
  if (ordBtn)  { ordBtn.style.background='var(--bg3)';     ordBtn.style.color='var(--text2)'; }

  const area = document.getElementById('admin-content-area');
  area.innerHTML = '<p style="color:var(--text2);padding:1rem">Calculating revenue...</p>';

  try {
    const orders = await apiGetAllOrders();

    if (!orders || orders.length === 0) {
      area.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <div class="empty-title">No revenue yet</div>
          <p>Revenue will appear here once users place orders</p>
          <button class="btn-primary"
            style="width:auto;padding:.6rem 1.5rem;margin-top:1rem"
            onclick="showAdminTab('products')">Back to Products</button>
        </div>`;
      return;
    }

    // ── Calculate per-product revenue ──
    // Go through every order → every item → accumulate
    var productMap = {};
    // productMap = { "productName": { name, emoji, qty, revenue } }

    orders.forEach(function(order) {
      (order.items || []).forEach(function(item) {
        var key = item.name || 'Unknown';
        if (!productMap[key]) {
          productMap[key] = {
            name:    item.name  || 'Unknown',
            emoji:   item.emoji || '📦',
            image:   item.image || '',
            qty:     0,
            revenue: 0
          };
        }
        productMap[key].qty     += Number(item.qty   || 0);
        productMap[key].revenue += Number(item.price || 0) * Number(item.qty || 0);
      });
    });

    // Convert map to array and sort by revenue (highest first)
    var productList = Object.values(productMap).sort(function(a, b) {
      return b.revenue - a.revenue;
    });

    // Total revenue
    var totalRevenue = orders.reduce(function(s, o) { return s + (o.total || 0); }, 0);
    var totalOrders  = orders.length;
    var totalItems   = productList.reduce(function(s, p) { return s + p.qty; }, 0);

    // Find highest revenue for progress bar scaling
    var maxRevenue = productList.length > 0 ? productList[0].revenue : 1;

    area.innerHTML = `
      <div class="admin-products-table">

        <!-- Header -->
        <div class="table-header">
          <div class="table-title" style="color:var(--accent3)">
            💰 Revenue Breakdown
          </div>
          <button onclick="showAdminTab('products')"
            style="background:none;border:1px solid var(--border);border-radius:6px;
                   color:var(--text2);padding:.3rem .8rem;cursor:pointer;
                   font-family:'Satoshi',sans-serif;font-size:.82rem">
            ← Back to Products
          </button>
        </div>

        <!-- Summary Row -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;
          padding:1.2rem 1.5rem;border-bottom:1px solid var(--border);
          background:rgba(67,233,123,.05)">
          <div style="text-align:center">
            <div style="font-size:1.6rem;font-weight:700;color:var(--accent3)">
              ₹${totalRevenue.toLocaleString()}
            </div>
            <div style="font-size:.78rem;color:var(--text3);margin-top:2px">
              Total Revenue
            </div>
          </div>
          <div style="text-align:center">
            <div style="font-size:1.6rem;font-weight:700;color:var(--accent)">
              ${totalOrders}
            </div>
            <div style="font-size:.78rem;color:var(--text3);margin-top:2px">
              Total Orders
            </div>
          </div>
          <div style="text-align:center">
            <div style="font-size:1.6rem;font-weight:700;color:#ffb74d">
              ${totalItems}
            </div>
            <div style="font-size:.78rem;color:var(--text3);margin-top:2px">
              Total Items Sold
            </div>
          </div>
        </div>

        <!-- Product Revenue Table -->
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
                <th>% of Total</th>
                <th>Revenue Bar</th>
              </tr>
            </thead>
            <tbody>
              ${productList.map(function(p, index) {

                // Percentage of total revenue
                var percent = totalRevenue > 0
                  ? ((p.revenue / totalRevenue) * 100).toFixed(1)
                  : 0;

                // Bar width relative to top product
                var barWidth = maxRevenue > 0
                  ? Math.round((p.revenue / maxRevenue) * 100)
                  : 0;

                // Bar color — top 3 get special colors
                var barColor = index === 0 ? 'var(--accent3)' :
                               index === 1 ? 'var(--accent)'  :
                               index === 2 ? '#ffb74d'        : 'var(--border)';

                // Rank medal for top 3
                var rank = index === 0 ? '🥇' :
                           index === 1 ? '🥈' :
                           index === 2 ? '🥉' : (index + 1);

                // Image or emoji
                var imgContent = p.image
                  ? `<img src="${p.image}" alt="${p.name}"
                       style="width:40px;height:40px;object-fit:cover;
                              border-radius:6px;vertical-align:middle;margin-right:8px"
                       onerror="this.style.display='none';this.nextElementSibling.style.display='inline'"/>
                     <span style="display:none;font-size:1.5rem">${p.emoji}</span>`
                  : `<span style="font-size:1.5rem">${p.emoji}</span>`;

                return `
                  <tr style="${index === 0 ? 'background:rgba(67,233,123,.04)' : ''}">
                    <td style="font-size:1.2rem;text-align:center">${rank}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:.5rem">
                        ${imgContent}
                        <span style="font-weight:600">${p.name}</span>
                      </div>
                    </td>
                    <td style="font-weight:700;color:var(--accent);text-align:center">
                      ${p.qty} units
                    </td>
                    <td style="font-weight:700;color:var(--accent3);font-size:1rem">
                      ₹${p.revenue.toLocaleString()}
                    </td>
                    <td style="font-weight:600;color:var(--text2)">
                      ${percent}%
                    </td>
                    <td style="min-width:120px">
                      <div style="background:var(--bg3);border-radius:4px;
                        height:8px;width:120px;overflow:hidden">
                        <div style="background:${barColor};height:100%;
                          width:${barWidth}%;border-radius:4px;
                          transition:width .5s ease"></div>
                      </div>
                    </td>
                  </tr>`;

              }).join('')}
            </tbody>
          </table>
        </div>

      </div>`;

  } catch(e) {
    area.innerHTML = `<p style="color:var(--accent2);padding:1rem">Error: ${e.message}</p>`;
  }
}


// ════════════════════════════════
//  SHOW LOW STOCK PRODUCTS
//  Called when admin clicks the
//  Low Stock stat card
// ════════════════════════════════
async function showLowStockProducts() {

  // Switch to products tab first
  adminCurrentView = 'products';
  const prodBtn = document.getElementById('tab-products-btn');
  const ordBtn  = document.getElementById('tab-orders-btn');
  if (prodBtn) { prodBtn.style.background='var(--accent)'; prodBtn.style.color='#fff'; }
  if (ordBtn)  { ordBtn.style.background='var(--bg3)';     ordBtn.style.color='var(--text2)'; }

  const area = document.getElementById('admin-content-area');
  area.innerHTML = '<p style="color:var(--text2);padding:1rem">Loading low stock items...</p>';

  try {
    const products  = await apiFetchProducts();
    const lowStockProducts = products.filter(function(p) { return p.stock <= 10; });

    if (lowStockProducts.length === 0) {
      area.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <div class="empty-title">All products are well stocked!</div>
          <p>No products have stock below 10</p>
          <button class="btn-primary"
            style="width:auto;padding:.6rem 1.5rem;margin-top:1rem"
            onclick="showAdminTab('products')">View All Products</button>
        </div>`;
      return;
    }

    area.innerHTML = `
      <div class="admin-products-table">
        <div class="table-header">
          <div class="table-title" style="color:var(--accent2)">
            ⚠️ Low Stock Products (${lowStockProducts.length})
          </div>
          <button onclick="showAdminTab('products')"
            style="background:none;border:1px solid var(--border);border-radius:6px;
                   color:var(--text2);padding:.3rem .8rem;cursor:pointer;
                   font-family:'Satoshi',sans-serif;font-size:.82rem">
            View All Products
          </button>
        </div>

        <!-- LOW STOCK ALERT BANNER -->
        <div style="background:rgba(255,101,132,.08);border-left:4px solid var(--accent2);
          padding:10px 16px;font-size:.85rem;color:var(--accent2);margin:0 0 0 0">
          These products have <strong>10 or fewer units</strong> remaining.
          Edit them to increase stock before they run out.
        </div>

        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th style="color:var(--accent2)">⚠️ Stock Left</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockProducts.map(function(p) {

                // Stock urgency color
                var stockColor = p.stock === 0 ? '#ff3d3d' : 'var(--accent2)';
                var stockLabel = p.stock === 0 ? '❌ OUT OF STOCK' : '⚠️ Only ' + p.stock + ' left';

                // Progress bar showing how critical stock is
                var barWidth = Math.min(p.stock * 10, 100); // 0-10 mapped to 0-100%
                var barColor = p.stock <= 3 ? '#ff3d3d' : 'var(--accent2)';

                var imgCell = p.image
                  ? `<img src="${p.image}" alt="${p.name}"
                       style="width:48px;height:48px;object-fit:cover;
                              border-radius:8px;border:2px solid var(--accent2)"
                       onerror="this.style.display='none';this.nextElementSibling.style.display='block'"/>
                     <span style="display:none;font-size:1.8rem">${p.emoji||'📦'}</span>`
                  : `<span style="font-size:1.8rem">${p.emoji||'📦'}</span>`;

                return `
                  <tr style="background:rgba(255,101,132,.04)">
                    <td>${imgCell}</td>
                    <td style="font-weight:600">${p.name}</td>
                    <td>${p.category}</td>
                    <td style="color:var(--accent);font-weight:700">
                      ₹${p.price.toLocaleString()}
                    </td>
                    <td>
                      <div style="color:${stockColor};font-weight:700;font-size:.95rem">
                        ${stockLabel}
                      </div>
                      <!-- Stock progress bar -->
                      <div style="background:var(--border);border-radius:4px;
                        height:5px;width:80px;margin-top:5px;overflow:hidden">
                        <div style="background:${barColor};height:100%;
                          width:${barWidth}%;border-radius:4px;
                          transition:width .3s"></div>
                      </div>
                    </td>
                    <td>⭐ ${p.rating}</td>
                    <td>
                      <button class="edit-btn"
                        onclick="openEditProductModal('${p._id}')"
                        style="background:var(--accent2);border-color:var(--accent2);color:#fff">
                        ✏️ Update Stock
                      </button>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

  } catch(e) {
    area.innerHTML = `<p style="color:var(--accent2);padding:1rem">Error: ${e.message}</p>`;
  }
}


// ════════════════════════════════
//  EXPOSE GLOBALLY
// ════════════════════════════════
window.renderAdminDashboard   = renderAdminDashboard;
window.showAdminTab           = showAdminTab;
window.openAddProductModal    = openAddProductModal;
window.openEditProductModal   = openEditProductModal;
window.saveProduct            = saveProduct;
window.confirmDeleteProduct   = confirmDeleteProduct;
window.previewAdminImage      = previewAdminImage;
window.loadOrdersTab          = loadOrdersTab;
window.showLowStockProducts   = showLowStockProducts;
window.showRevenueBreakdown   = showRevenueBreakdown;

console.log('⚙️ admin.js loaded');