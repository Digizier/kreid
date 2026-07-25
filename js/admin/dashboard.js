/**
 * KREID Administrative Control Suite Dashboard
 * 24 individual 1-hour hourly live sales SVG graph, storefront order sync, payment proof screenshot inspector, coupon activator/deactivator, and gateway accounts manager.
 */

import { appStore } from '../store/appStore.js';

let activeTab = 'dashboard'; // 'dashboard' | 'products' | 'orders' | 'coupons' | 'settings'
let editingProduct = null;
let uploadedImages = [];

export function renderAdminDashboard(container, state) {
  const validOrders = state.orders.filter(o => o.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = state.orders.length;
  const totalProducts = state.products.length;
  const lowStockCount = state.products.filter(p => p.stock <= 5).length;

  container.innerHTML = `
    <div class="admin-layout">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar">
        <div class="brand-logo" style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <img src="assets/kreid-logo.svg" alt="KREID COUTURE" style="height: 48px;" />
        </div>
        <div style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 700; letter-spacing: 0.15em; margin-bottom: 1.5rem; text-transform: uppercase;">
          ADMIN CONTROL SUITE
        </div>

        <nav class="sidebar-menu">
          <div class="menu-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
            📊 Executive Dashboard
          </div>
          <div class="menu-item ${activeTab === 'products' ? 'active' : ''}" data-tab="products">
            📦 Product Catalog (${totalProducts})
          </div>
          <div class="menu-item ${activeTab === 'orders' ? 'active' : ''}" data-tab="orders">
            🚚 Orders & Dispatch (${totalOrders})
          </div>
          <div class="menu-item ${activeTab === 'coupons' ? 'active' : ''}" data-tab="coupons">
            🎟️ Discount Coupons (${state.coupons.length})
          </div>
          <div class="menu-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
            ⚙️ Gateway & Logistics
          </div>
        </nav>

        <div style="margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--border-light);">
          <button class="btn btn-outline-gold" id="btn-admin-go-store" style="width: 100%; font-size: 0.8rem;">
            🛍️ Return to Storefront
          </button>
        </div>
      </aside>

      <!-- Admin Main Area -->
      <main class="admin-main">
        <!-- Top Bar -->
        <div class="admin-top-bar">
          <div>
            <h1 class="admin-page-title">
              ${activeTab === 'dashboard' ? 'Executive Overview & 24hr Hourly Live Analytics' :
                activeTab === 'products' ? 'Product Inventory Manager' :
                activeTab === 'orders' ? 'Order Fulfillment & Payment Proof Inspector' :
                activeTab === 'coupons' ? 'Promotions & Coupons Engine' : 'Payment Accounts & Logistics Settings'}
            </h1>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Connected Live to KREID Storefront Data Engine
            </p>
          </div>

          <div style="display: flex; gap: 0.8rem;">
            ${activeTab === 'products' ? `
              <button class="btn btn-primary" id="btn-open-add-product-modal">
                + Add New Product
              </button>
            ` : ''}
            ${activeTab === 'coupons' ? `
              <button class="btn btn-primary" id="btn-open-add-coupon-modal">
                + Create Coupon Code
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Dynamic Tab Content -->
        ${renderTabContent(state, totalRevenue, totalOrders, totalProducts, lowStockCount)}

      </main>
    </div>

    <!-- Modals Roots -->
    <div id="admin-product-modal-root" class="modal-overlay"></div>
    <div id="admin-coupon-modal-root" class="modal-overlay"></div>
    <div id="admin-order-modal-root" class="modal-overlay"></div>
    <div id="admin-proof-modal-root" class="modal-overlay"></div>
  `;

  // Attach Sidebar Tab Listeners
  const menuItems = container.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      activeTab = item.dataset.tab;
      renderAdminDashboard(container, state);
    });
  });

  // Return to Storefront
  container.querySelector('#btn-admin-go-store')?.addEventListener('click', () => {
    window.location.hash = '';
    appStore.setView('storefront');
  });

  // Add Product Button Trigger
  container.querySelector('#btn-open-add-product-modal')?.addEventListener('click', () => {
    editingProduct = null;
    uploadedImages = [];
    openProductEditModal(container, state);
  });

  // Add Coupon Button Trigger
  container.querySelector('#btn-open-add-coupon-modal')?.addEventListener('click', () => {
    openCouponCreateModal(container, state);
  });

  // Attach Table Action Listeners
  attachTableEventListeners(container, state);
}

function renderTabContent(state, totalRevenue, totalOrders, totalProducts, lowStockCount) {
  if (activeTab === 'dashboard') {
    return `
      <!-- Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div>
            <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Total Gross Revenue</div>
            <div class="metric-value">PKR ${totalRevenue.toLocaleString()}</div>
          </div>
          <div class="metric-icon">💰</div>
        </div>

        <div class="metric-card">
          <div>
            <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Orders Received</div>
            <div class="metric-value">${totalOrders}</div>
          </div>
          <div class="metric-icon">📦</div>
        </div>

        <div class="metric-card">
          <div>
            <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Catalog SKUs</div>
            <div class="metric-value">${totalProducts}</div>
          </div>
          <div class="metric-icon">👟</div>
        </div>

        <div class="metric-card">
          <div>
            <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Low Stock Warning</div>
            <div class="metric-value" style="color: var(--accent-neon);">${lowStockCount}</div>
          </div>
          <div class="metric-icon">⚠️</div>
        </div>
      </div>

      <!-- Real Dynamic 24-Hour (1h to 24h) Hourly Sales Graph -->
      <div class="chart-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1.1rem; color: var(--accent-gold);">📈 24-Hour (1h - 24h) Hourly Sales Performance</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Real-time 1-hour breakdown calculated from storefront customer orders</p>
          </div>
          <span class="badge badge-green">24-HOUR HOURLY LIVE</span>
        </div>

        ${render24HourSVGChart(state.orders)}
      </div>

      <!-- Recent Live Orders -->
      <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">Recent Customer Orders</h3>
      ${renderOrdersTable(state.orders.slice(0, 5))}
    `;
  }

  if (activeTab === 'products') {
    return `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price (PKR)</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.products.map(p => `
              <tr>
                <td>
                  <img src="${p.images ? p.images[0] : ''}" class="table-img" alt="${p.name}" />
                </td>
                <td>
                  <strong style="color: #ffffff; font-size: 0.95rem;">${p.name}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">SKU: ${p.id} | Model: ${p.model || 'N/A'}</div>
                </td>
                <td><span class="badge badge-gold">${p.category}</span></td>
                <td><strong>PKR ${p.price.toLocaleString()}</strong></td>
                <td><strong>${p.stock}</strong></td>
                <td>
                  <span class="status-pill ${p.stock > 10 ? 'instock' : p.stock > 0 ? 'processing' : 'lowstock'}">
                    ${p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-edit-product" data-id="${p.id}" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;">
                    ✏️ Edit
                  </button>
                  <button class="btn btn-outline-gold btn-delete-product" data-id="${p.id}" style="padding: 0.4rem 0.8rem; font-size: 0.78rem; color: var(--accent-neon);">
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (activeTab === 'orders') {
    return renderOrdersTable(state.orders);
  }

  if (activeTab === 'coupons') {
    return `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount Type</th>
              <th>Minimum Spend</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.coupons.map(c => `
              <tr>
                <td><strong style="color: var(--accent-gold); font-size: 1.05rem;">${c.code}</strong></td>
                <td>${c.freeShipping ? 'FREE Shipping' : `${c.discountPercent}% OFF`}</td>
                <td>PKR ${c.minSpend.toLocaleString()}</td>
                <td>
                  <span class="badge ${c.isActive ? 'badge-green' : 'badge-red'}">
                    ${c.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-toggle-coupon" data-code="${c.code}" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;">
                    ${c.isActive ? '🔒 Deactivate' : '🔓 Activate'}
                  </button>
                  <button class="btn btn-outline-gold btn-delete-coupon" data-code="${c.code}" style="padding: 0.4rem 0.8rem; font-size: 0.78rem; color: var(--accent-neon);">
                    🗑️ Remove
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (activeTab === 'settings') {
    const p = state.paymentSettings;
    return `
      <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 2rem; border-radius: var(--radius-md); max-width: 800px;">
        <h3 style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 1.5rem;">💳 Storefront Payment Accounts & Logistics Settings</h3>
        
        <form id="payment-settings-form">
          <div style="border-bottom: 1px dashed var(--border-light); padding-bottom: 1rem; margin-bottom: 1.2rem;">
            <h4 style="color: #fff; margin-bottom: 0.8rem;">1. JazzCash Account Details</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">JazzCash Account Title</label>
                <input type="text" name="jazzcashTitle" class="form-input" value="${p.jazzcash.title}" />
              </div>
              <div class="form-group">
                <label class="form-label">JazzCash Mobile Number</label>
                <input type="text" name="jazzcashNumber" class="form-input" value="${p.jazzcash.number}" />
              </div>
            </div>
          </div>

          <div style="border-bottom: 1px dashed var(--border-light); padding-bottom: 1rem; margin-bottom: 1.2rem;">
            <h4 style="color: #fff; margin-bottom: 0.8rem;">2. EasyPaisa Account Details</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">EasyPaisa Account Title</label>
                <input type="text" name="easypaisaTitle" class="form-input" value="${p.easypaisa.title}" />
              </div>
              <div class="form-group">
                <label class="form-label">EasyPaisa Mobile Number</label>
                <input type="text" name="easypaisaNumber" class="form-input" value="${p.easypaisa.number}" />
              </div>
            </div>
          </div>

          <div style="border-bottom: 1px dashed var(--border-light); padding-bottom: 1rem; margin-bottom: 1.2rem;">
            <h4 style="color: #fff; margin-bottom: 0.8rem;">3. SadaPay / NayaPay Account Details</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">SadaPay Account Title</label>
                <input type="text" name="sadapayTitle" class="form-input" value="${p.sadapay.title}" />
              </div>
              <div class="form-group">
                <label class="form-label">SadaPay Number</label>
                <input type="text" name="sadapayNumber" class="form-input" value="${p.sadapay.number}" />
              </div>
            </div>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h4 style="color: #fff; margin-bottom: 0.8rem;">4. Pakistani Bank Account Details</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Bank Name</label>
                <input type="text" name="bankName" class="form-input" value="${p.bank.bankName}" />
              </div>
              <div class="form-group">
                <label class="form-label">Account Title</label>
                <input type="text" name="bankTitle" class="form-input" value="${p.bank.title}" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">IBAN Number</label>
              <input type="text" name="bankIban" class="form-input" value="${p.bank.iban}" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">
            💾 Save Payment Accounts & Details
          </button>
        </form>
      </div>
    `;
  }
}

/* Dynamic 24 Individual 1-Hour Interval Sales SVG Graph Builder (1h, 2h, 3h ... 24h) */
function render24HourSVGChart(orders) {
  // 24 individual 1-hour slots: 0h to 23h
  const hourlySlots = Array(24).fill(0);

  orders.forEach(o => {
    if (o.status === 'Cancelled') return;
    const hour = o.timestamp ? new Date(o.timestamp).getHours() : 12;
    hourlySlots[hour] += o.total;
  });

  const maxVal = Math.max(...hourlySlots, 8000);
  const width = 1100;
  const height = 180;
  const paddingX = 40;

  const points = hourlySlots.map((val, hour) => {
    const x = paddingX + (hour / 23) * (width - 2 * paddingX);
    const y = height - 30 - (val / maxVal) * (height - 60);
    return { x, y, val, hour };
  });

  const pathD = `M ${paddingX},${height - 30} ` + points.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${width - paddingX},${height - 30} Z`;
  const strokeD = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');

  return `
    <div style="overflow-x: auto; padding-bottom: 0.5rem;">
      <svg class="svg-chart" viewBox="0 0 ${width} ${height + 30}" style="min-width: 900px;">
        <!-- Grid Lines -->
        <line x1="${paddingX}" y1="30" x2="${width - paddingX}" y2="30" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
        <line x1="${paddingX}" y1="80" x2="${width - paddingX}" y2="80" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
        <line x1="${paddingX}" y1="130" x2="${width - paddingX}" y2="130" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

        <!-- Area Gradient Fill -->
        <path d="${pathD}" fill="url(#live-chart-grad-24)" />

        <!-- Glowing Line -->
        <path d="${strokeD}" fill="none" stroke="#d4af37" stroke-width="3" filter="drop-shadow(0 0 6px rgba(212,175,55,0.6))" />

        <!-- Data Dots & 24 Individual 1-Hour Labels (1h, 2h, 3h... 24h) -->
        ${points.map((p) => `
          <circle cx="${p.x}" cy="${p.y}" r="4" fill="#0a0a0d" stroke="#d4af37" stroke-width="2" />
          ${p.val > 0 ? `
            <text x="${p.x}" y="${p.y - 8}" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle">
              PKR ${(p.val / 1000).toFixed(1)}k
            </text>
          ` : ''}
          <text x="${p.x}" y="${height + 15}" fill="#a0a0b0" font-size="10" text-anchor="middle">
            ${p.hour + 1}h
          </text>
        `).join('')}

        <defs>
          <linearGradient id="live-chart-grad-24" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#d4af37" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#d4af37" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  `;
}

function renderOrdersTable(orders) {
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer & Phone</th>
            <th>City & Address</th>
            <th>Courier</th>
            <th>Total Amount</th>
            <th>Payment & Proof</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${orders.length === 0 ? `
            <tr>
              <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                No storefront orders received yet.
              </td>
            </tr>
          ` : orders.map(o => `
            <tr>
              <td>
                <strong style="color: #ffffff; font-size: 0.95rem;">#${o.id}</strong>
                <div style="font-size: 0.75rem; color: var(--accent-gold);">${o.trackingNo}</div>
              </td>
              <td>
                <strong style="color: #ffffff;">${o.customerName}</strong>
                <div style="font-size: 0.78rem; color: var(--text-muted);">${o.phone}</div>
              </td>
              <td>
                <strong style="color: #ffffff;">${o.city}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${o.address}</div>
              </td>
              <td><span class="badge badge-gold">${o.courier}</span></td>
              <td><strong style="color: #ffffff;">PKR ${o.total.toLocaleString()}</strong></td>
              <td>
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-gold);">${o.paymentMethod}</div>
                ${o.paymentProof ? `
                  <button class="btn btn-outline-gold btn-view-proof" data-id="${o.id}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; margin-top: 0.3rem;">
                    📷 View Proof
                  </button>
                ` : '<span style="font-size: 0.72rem; color: var(--text-muted);">No Proof File</span>'}
              </td>
              <td>
                <select class="form-select admin-order-status-select" data-id="${o.id}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;">
                  <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                  <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                  <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
              </td>
              <td>
                <button class="btn btn-secondary btn-view-order-details" data-id="${o.id}" style="padding: 0.35rem 0.7rem; font-size: 0.78rem;">
                  📄 Slip
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function attachTableEventListeners(container, state) {
  // Save Payment Settings Form
  const payForm = container.querySelector('#payment-settings-form');
  if (payForm) {
    payForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(payForm);
      appStore.savePaymentSettings({
        jazzcash: { title: fd.get('jazzcashTitle'), number: fd.get('jazzcashNumber') },
        easypaisa: { title: fd.get('easypaisaTitle'), number: fd.get('easypaisaNumber') },
        sadapay: { title: fd.get('sadapayTitle'), number: fd.get('sadapayNumber') },
        bank: { bankName: fd.get('bankName'), title: fd.get('bankTitle'), iban: fd.get('bankIban') }
      });
    });
  }

  // Toggle Coupon Status
  container.querySelectorAll('.btn-toggle-coupon').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      appStore.toggleCouponStatus(code);
      renderAdminDashboard(container, appStore.state);
    });
  });

  // Delete Coupon
  container.querySelectorAll('.btn-delete-coupon').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      if (confirm(`Remove coupon code ${code}?`)) {
        appStore.deleteCoupon(code);
        renderAdminDashboard(container, appStore.state);
      }
    });
  });

  // Order Status Change
  container.querySelectorAll('.admin-order-status-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const orderId = sel.dataset.id;
      const newStatus = e.target.value;
      appStore.updateOrderStatus(orderId, newStatus);
    });
  });

  // View Payment Proof
  container.querySelectorAll('.btn-view-proof').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.id;
      const order = state.orders.find(o => o.id === orderId);
      if (order && order.paymentProof) {
        openPaymentProofModal(container, order);
      }
    });
  });

  // Edit Product
  container.querySelectorAll('.btn-edit-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.dataset.id;
      editingProduct = state.products.find(p => p.id === prodId);
      uploadedImages = editingProduct ? [...editingProduct.images] : [];
      openProductEditModal(container, state);
    });
  });

  // Delete Product
  container.querySelectorAll('.btn-delete-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.dataset.id;
      if (confirm("Are you sure you want to delete this item from the catalog?")) {
        appStore.deleteProduct(prodId);
        renderAdminDashboard(container, appStore.state);
      }
    });
  });

  // View Order Slip
  container.querySelectorAll('.btn-view-order-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.id;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        openOrderSlipModal(container, order);
      }
    });
  });
}

/* Coupon Creation Modal */
function openCouponCreateModal(container, state) {
  const modalRoot = container.querySelector('#admin-coupon-modal-root');
  if (!modalRoot) return;

  modalRoot.classList.add('active');

  modalRoot.innerHTML = `
    <div class="checkout-modal-card" style="max-width: 500px;">
      <button class="modal-close-btn" id="btn-close-coupon-modal">✕</button>

      <h2 style="font-size: 1.5rem; margin-bottom: 0.3rem;">🎟️ Create Discount Coupon</h2>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.2rem;">
        Add a new promotional promo code for customers.
      </p>

      <form id="coupon-form">
        <div class="form-group">
          <label class="form-label">Coupon Code *</label>
          <input type="text" name="code" required class="form-input" placeholder="e.g. SUMMER20" style="text-transform: uppercase;" />
        </div>

        <div class="form-group">
          <label class="form-label">Discount Percentage (%) *</label>
          <input type="number" name="discountPercent" required class="form-input" placeholder="e.g. 15" />
        </div>

        <div class="form-group">
          <label class="form-label">Minimum Spend (PKR)</label>
          <input type="number" name="minSpend" class="form-input" placeholder="e.g. 3000" value="2000" />
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">
          ⚡ Publish Coupon Code
        </button>
      </form>
    </div>
  `;

  modalRoot.querySelector('#btn-close-coupon-modal').addEventListener('click', () => {
    modalRoot.classList.remove('active');
  });

  const form = modalRoot.querySelector('#coupon-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    appStore.saveCoupon({
      code: fd.get('code'),
      discountPercent: parseInt(fd.get('discountPercent')),
      minSpend: parseInt(fd.get('minSpend')) || 0
    });
    modalRoot.classList.remove('active');
    renderAdminDashboard(container, appStore.state);
  });
}

/* Payment Proof Inspector Modal */
function openPaymentProofModal(container, order) {
  const modalRoot = container.querySelector('#admin-proof-modal-root');
  if (!modalRoot) return;

  modalRoot.classList.add('active');

  modalRoot.innerHTML = `
    <div class="checkout-modal-card" style="max-width: 550px; text-align: center;">
      <button class="modal-close-btn" id="btn-close-proof-modal">✕</button>

      <h2 style="font-size: 1.4rem; margin-bottom: 0.3rem;">📷 Payment Proof Screenshot</h2>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.2rem;">
        Order #${order.id} | ${order.customerName} (${order.paymentMethod})
      </p>

      <div style="background: #000; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-gold); margin-bottom: 1rem;">
        <img src="${order.paymentProof}" alt="Payment Proof" style="max-width: 100%; max-height: 60vh; object-fit: contain; border-radius: var(--radius-sm);" />
      </div>

      <button class="btn btn-primary" id="btn-proof-verify-ok" style="width: 100%;">
        ✓ Close Inspector
      </button>
    </div>
  `;

  modalRoot.querySelector('#btn-close-proof-modal').addEventListener('click', () => {
    modalRoot.classList.remove('active');
  });

  modalRoot.querySelector('#btn-proof-verify-ok').addEventListener('click', () => {
    modalRoot.classList.remove('active');
  });
}

/* Rich Add / Edit Product Modal Dialog with File Reader Upload */
function openProductEditModal(container, state) {
  const modalRoot = container.querySelector('#admin-product-modal-root');
  if (!modalRoot) return;

  const isEdit = !!editingProduct;
  const prod = editingProduct || {
    name: '',
    model: '',
    category: 'shoes',
    price: 4500,
    originalPrice: 5500,
    stock: 15,
    description: '',
    features: ['Premium Quality Material', 'Durable Construction', 'Ideal for daily wear'],
    sizes: ['39', '40', '41', '42', '43', '44'],
    images: []
  };

  modalRoot.classList.add('active');

  modalRoot.innerHTML = `
    <div class="checkout-modal-card" style="max-width: 750px;">
      <button class="modal-close-btn" id="btn-close-prod-modal">✕</button>

      <h2 style="font-size: 1.6rem; margin-bottom: 0.3rem;">
        ${isEdit ? '✏️ Edit Product Details' : '✨ Add New Product to Catalog'}
      </h2>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
        Changes will immediately reflect on the KREID customer storefront.
      </p>

      <form id="product-modal-form">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Product Title *</label>
            <input type="text" name="name" required class="form-input" value="${prod.name}" placeholder="e.g. Nike Air Jordan 1 Low" />
          </div>

          <div class="form-group">
            <label class="form-label">Category *</label>
            <select name="category" class="form-select">
              <option value="shoes" ${prod.category === 'shoes' ? 'selected' : ''}>Shoes & Sneakers</option>
              <option value="trousers" ${prod.category === 'trousers' ? 'selected' : ''}>Baggy Trousers</option>
              <option value="tshirts" ${prod.category === 'tshirts' ? 'selected' : ''}>T-Shirts</option>
              <option value="pants" ${prod.category === 'pants' ? 'selected' : ''}>Utility Pants</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Price (PKR) *</label>
            <input type="number" name="price" required class="form-input" value="${prod.price}" />
          </div>

          <div class="form-group">
            <label class="form-label">Original/Regular Price (PKR)</label>
            <input type="number" name="originalPrice" class="form-input" value="${prod.originalPrice || ''}" />
          </div>

          <div class="form-group">
            <label class="form-label">Stock Quantity *</label>
            <input type="number" name="stock" required class="form-input" value="${prod.stock}" />
          </div>
        </div>

        <!-- File Upload Drag & Drop Simulator -->
        <div class="form-group">
          <label class="form-label">Product Images (Upload File or Enter Image URL)</label>
          <div class="file-upload-box" id="file-drop-zone">
            <div style="font-size: 1.8rem; margin-bottom: 0.3rem;">📸</div>
            <strong style="color: var(--accent-gold); font-size: 0.9rem;">Click to Select Local Image File</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Supports JPG, PNG, WEBP (Auto-converts to preview URL)</div>
            <input type="file" id="file-input-element" accept="image/*" style="display: none;" />
          </div>

          <div style="margin-top: 0.8rem;">
            <input type="url" id="image-url-fallback" class="form-input" placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)" />
          </div>

          <div class="image-preview-grid" id="preview-grid">
            ${uploadedImages.map(img => `
              <div class="img-preview-item">
                <img src="${img}" alt="Preview" />
              </div>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Product Description</label>
          <textarea name="description" class="form-input" rows="3" style="resize: vertical;">${prod.description}</textarea>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.9rem;">
          ${isEdit ? '💾 Update Product' : '🚀 Publish Product to Catalog'}
        </button>
      </form>
    </div>
  `;

  // Attach File Upload Event
  const dropZone = modalRoot.querySelector('#file-drop-zone');
  const fileInput = modalRoot.querySelector('#file-input-element');
  const previewGrid = modalRoot.querySelector('#preview-grid');
  const urlFallback = modalRoot.querySelector('#image-url-fallback');

  dropZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        uploadedImages.unshift(base64Url);
        renderPreviewGrid();
      };
      reader.readAsDataURL(file);
    }
  });

  urlFallback.addEventListener('change', (e) => {
    if (e.target.value) {
      uploadedImages.unshift(e.target.value);
      renderPreviewGrid();
      e.target.value = '';
    }
  });

  function renderPreviewGrid() {
    previewGrid.innerHTML = uploadedImages.map(img => `
      <div class="img-preview-item">
        <img src="${img}" alt="Preview" />
      </div>
    `).join('');
  }

  // Close Modal
  modalRoot.querySelector('#btn-close-prod-modal').addEventListener('click', () => {
    modalRoot.classList.remove('active');
  });

  // Submit Modal Form
  const form = modalRoot.querySelector('#product-modal-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    const finalImages = uploadedImages.length > 0 ? uploadedImages : [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
    ];

    const updatedData = {
      id: isEdit ? prod.id : undefined,
      name: formData.get('name'),
      category: formData.get('category'),
      price: parseInt(formData.get('price')),
      originalPrice: parseInt(formData.get('originalPrice')) || undefined,
      stock: parseInt(formData.get('stock')),
      description: formData.get('description'),
      images: finalImages,
      sizes: ['39', '40', '41', '42', '43', '44'],
      inStock: parseInt(formData.get('stock')) > 0
    };

    appStore.saveProduct(updatedData);
    modalRoot.classList.remove('active');
    renderAdminDashboard(container, appStore.state);
  });
}

/* Printable Shipping Consignment Slip Modal */
function openOrderSlipModal(container, order) {
  const modalRoot = container.querySelector('#admin-order-modal-root');
  if (!modalRoot) return;

  modalRoot.classList.add('active');

  modalRoot.innerHTML = `
    <div class="checkout-modal-card" style="max-width: 600px; background: #ffffff; color: #000000;">
      <button class="modal-close-btn" id="btn-close-order-slip" style="background: #eee; color: #000;">✕</button>

      <div style="border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-size: 1.5rem; color: #000;">KREID COUTURE</h2>
          <div style="font-size: 0.8rem; color: #555;">CONSIGNMENT DISPATCH SLIP</div>
        </div>
        <div style="text-align: right;">
          <strong style="font-size: 1.1rem; color: #000;">${order.courier}</strong>
          <div style="font-size: 0.85rem; font-family: monospace;">${order.trackingNo}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem; margin-bottom: 1rem; border-bottom: 1px dashed #ccc; padding-bottom: 1rem;">
        <div>
          <strong>CUSTOMER DETAILS:</strong>
          <div>Name: ${order.customerName}</div>
          <div>Phone: ${order.phone}</div>
          <div>City: ${order.city}</div>
          <div>Address: ${order.address}</div>
        </div>
        <div>
          <strong>PAYMENT & ORDER:</strong>
          <div>Order ID: #${order.id}</div>
          <div>Date: ${order.date}</div>
          <div>Payment: ${order.paymentMethod}</div>
          <div style="font-weight: 800; font-size: 1.1rem; margin-top: 0.4rem;">TOTAL: PKR ${order.total.toLocaleString()}</div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 1.5rem;">
        <thead>
          <tr style="background: #eee;">
            <th style="padding: 0.5rem; text-align: left;">Item</th>
            <th style="padding: 0.5rem; text-align: center;">Size</th>
            <th style="padding: 0.5rem; text-align: center;">Qty</th>
            <th style="padding: 0.5rem; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 0.5rem;">${item.name}</td>
              <td style="padding: 0.5rem; text-align: center;">${item.selectedSize}</td>
              <td style="padding: 0.5rem; text-align: center;">${item.quantity}</td>
              <td style="padding: 0.5rem; text-align: right;">PKR ${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${order.paymentProof ? `
        <div style="margin-bottom: 1rem; border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px; text-align: center;">
          <small style="display: block; font-weight: bold; margin-bottom: 0.3rem;">PAYMENT PROOF SCREENSHOT ATTACHED:</small>
          <img src="${order.paymentProof}" style="max-height: 120px; object-fit: contain;" />
        </div>
      ` : ''}

      <button class="btn btn-primary" onclick="window.print()" style="width: 100%; background: #000; color: #fff;">
        🖨️ Print Consignment Shipping Slip
      </button>
    </div>
  `;

  modalRoot.querySelector('#btn-close-order-slip').addEventListener('click', () => {
    modalRoot.classList.remove('active');
  });
}
