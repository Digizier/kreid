/**
 * KREID Administrative Control Suite Dashboard
 * Integrated 24-hour live sales graph, live storefront order sync, WhatsApp Automation & Dual-Gateway Suite, coupon manager, payment gateway account editor, custom retention auto-purge engine & "DELETE" confirmation wipe modal.
 */

import { appStore } from '../store/appStore.js';
import { renderWhatsAppManager } from './whatsappManager.js';

let activeTab = 'dashboard'; // 'dashboard' | 'products' | 'orders' | 'coupons' | 'whatsapp' | 'settings'
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
          <div class="menu-item ${activeTab === 'whatsapp' ? 'active' : ''}" data-tab="whatsapp">
            📱 WhatsApp Automation
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
                activeTab === 'whatsapp' ? 'WhatsApp Automation & Dual-Gateway Suite' :
                activeTab === 'coupons' ? 'Promotions & Coupons Engine' : 'Payment Accounts & Logistics Settings'}
            </h1>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Connected Live to KREID Storefront Data Engine
            </p>
          </div>

          <div style="display: flex; gap: 0.8rem; align-items: center;">
            ${activeTab === 'products' ? `
              <button class="btn btn-primary" id="btn-open-add-product-modal">
                + Add New Product
              </button>
            ` : ''}
            ${activeTab === 'orders' ? `
              <button class="btn" id="btn-trigger-wipe-orders" style="background: rgba(230, 57, 70, 0.15); border: 1.5px solid var(--accent-neon); color: var(--accent-neon); font-weight: 800; padding: 0.6rem 1.1rem; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.25s ease; box-shadow: 0 0 15px rgba(230,57,70,0.25);">
                🗑️ WIPE ALL ORDERS DATA
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
        ${activeTab === 'whatsapp' 
          ? '<div id="whatsapp-tab-container"></div>'
          : renderTabContent(state, totalRevenue, totalOrders, totalProducts, lowStockCount)}

      </main>
    </div>

    <!-- Modals Roots -->
    <div id="admin-product-modal-root" class="modal-overlay"></div>
    <div id="admin-coupon-modal-root" class="modal-overlay"></div>
    <div id="admin-order-modal-root" class="modal-overlay"></div>
    <div id="admin-proof-modal-root" class="modal-overlay"></div>
  `;

  // Render WhatsApp Sub Tab if active
  if (activeTab === 'whatsapp') {
    const waContainer = container.querySelector('#whatsapp-tab-container');
    if (waContainer) renderWhatsAppManager(waContainer, state);
  }

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

  // Trigger Wipe Orders Confirmation Modal
  const wipeOrdersTrigger = container.querySelector('#btn-trigger-wipe-orders');
  const wipeOrdersOverlay = container.querySelector('#wipe-orders-confirm-modal-overlay');
  const confirmWipeInput = container.querySelector('#input-confirm-wipe-orders-text');
  const confirmWipeBtn = container.querySelector('#btn-confirm-wipe-orders');
  const cancelWipeBtn = container.querySelector('#btn-cancel-wipe-orders');

  wipeOrdersTrigger?.addEventListener('click', () => {
    if (wipeOrdersOverlay) wipeOrdersOverlay.style.display = 'flex';
    if (confirmWipeInput) {
      confirmWipeInput.value = '';
      confirmWipeInput.focus();
    }
    if (confirmWipeBtn) {
      confirmWipeBtn.disabled = true;
      confirmWipeBtn.style.background = '#555';
      confirmWipeBtn.style.color = '#aaa';
      confirmWipeBtn.style.cursor = 'not-allowed';
    }
  });

  cancelWipeBtn?.addEventListener('click', () => {
    if (wipeOrdersOverlay) wipeOrdersOverlay.style.display = 'none';
  });

  confirmWipeInput?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val === 'DELETE') {
      confirmWipeBtn.disabled = false;
      confirmWipeBtn.style.background = 'var(--accent-neon)';
      confirmWipeBtn.style.color = '#ffffff';
      confirmWipeBtn.style.cursor = 'pointer';
      confirmWipeBtn.style.boxShadow = '0 0 15px rgba(230,57,70,0.5)';
    } else {
      confirmWipeBtn.disabled = true;
      confirmWipeBtn.style.background = '#555';
      confirmWipeBtn.style.color = '#aaa';
      confirmWipeBtn.style.cursor = 'not-allowed';
      confirmWipeBtn.style.boxShadow = 'none';
    }
  });

  confirmWipeBtn?.addEventListener('click', () => {
    appStore.wipeAllOrders();
    if (wipeOrdersOverlay) wipeOrdersOverlay.style.display = 'none';
    renderAdminDashboard(container, appStore.state);
  });

  // Save Retention & Purge Form
  const retentionForm = container.querySelector('#order-retention-form');
  retentionForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const daysInput = container.querySelector('#input-order-retention-days');
    const days = parseInt(daysInput ? daysInput.value : '30') || 0;
    appStore.state.orderRetentionDays = days;
    appStore.saveStorage('kreid_order_retention_days', days);
    appStore.purgeOldOrders(days);
    renderAdminDashboard(container, appStore.state);
  });

  // Add Coupon Button Trigger
  container.querySelector('#btn-open-add-coupon-modal')?.addEventListener('click', () => {
    openCouponModal(container, state);
  });

  // Attach Table Action Listeners (Edit Product, Delete Product, Update Status, Payment Proof Modal)
  attachTableEventListeners(container, state);
}

function renderTabContent(state, totalRevenue, totalOrders, totalProducts, lowStockCount) {
  if (activeTab === 'dashboard') {
    return `
      <!-- Metric Cards Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div>
            <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase;">Total Storefront Sales</div>
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
    const retentionDays = state.orderRetentionDays !== undefined ? state.orderRetentionDays : 30;
    return `
      <!-- Order Retention Auto-Purge Control Bar -->
      <div style="background: var(--bg-secondary); border: 1.5px solid var(--border-gold); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <span style="font-size: 1.4rem; color: var(--accent-gold);">🗓️</span>
          <div>
            <h4 style="color: var(--accent-gold); font-size: 0.98rem; margin-bottom: 0.15rem; font-weight: 800;">
              ⏰ Auto-Delete Past Customer Order History Data
            </h4>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">
              Specify custom days threshold to automatically purge old orders (Set 0 to never delete)
            </p>
          </div>
        </div>

        <form id="order-retention-form" style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
          <label style="font-size: 0.85rem; color: #fff;">Purge orders older than:</label>
          <input type="number" id="input-order-retention-days" min="0" max="365" value="${retentionDays}" style="width: 85px; padding: 0.45rem; background: var(--bg-primary); border: 1.5px solid var(--border-gold); color: #fff; border-radius: var(--radius-sm); font-weight: 800; text-align: center;" />
          <span style="font-size: 0.85rem; color: var(--text-muted);">Days</span>
          <button type="submit" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.45rem 1rem;">
            💾 Save Retention Rule & Purge Now
          </button>
        </form>
      </div>

      <!-- Main Order Fulfillment Table -->
      ${renderOrdersTable(state.orders)}

      <!-- High-Contrast Confirmation Modal for Wiping Orders -->
      <div id="wipe-orders-confirm-modal-overlay" class="modal-backdrop" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 10000; justify-content: center; align-items: center; padding: 1rem;">
        <div style="background: var(--bg-card); border: 2px solid var(--accent-neon); border-radius: var(--radius-md); width: 100%; max-width: 480px; padding: 2rem; box-shadow: 0 0 40px rgba(230,57,70,0.4); text-align: center;">
          <div style="font-size: 2.8rem; color: var(--accent-neon); margin-bottom: 0.5rem;">⚠️</div>
          <h3 style="color: #ffffff; font-size: 1.3rem; font-weight: 800; margin-bottom: 0.6rem;">PERMANENTLY WIPE ALL ORDER DATA?</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.4rem; line-height: 1.5;">
            This action will permanently delete all customer orders (${state.orders.length} records) from local storage. This action <strong>cannot be undone</strong>!
          </p>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 0.8rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem;">
            <label style="font-size: 0.82rem; color: var(--accent-gold); display: block; margin-bottom: 0.4rem; font-weight: 700;">
              Type "DELETE" below to confirm wiping:
            </label>
            <input type="text" id="input-confirm-wipe-orders-text" placeholder="DELETE" style="width: 100%; text-align: center; padding: 0.6rem; background: var(--bg-primary); border: 1.5px solid var(--border-gold); color: #ffffff; font-weight: 800; font-size: 1rem; border-radius: 4px; outline: none; letter-spacing: 0.1em;" />
          </div>
          <div style="display: flex; gap: 0.8rem;">
            <button class="btn btn-secondary" id="btn-cancel-wipe-orders" style="flex: 1; padding: 0.7rem;">Cancel</button>
            <button class="btn" id="btn-confirm-wipe-orders" disabled style="flex: 1; padding: 0.7rem; background: #555; color: #aaa; cursor: not-allowed; font-weight: 700; border: none; transition: all 0.2s ease;">Confirm Delete</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === 'coupons') {
    return `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount Type</th>
              <th>Min Spend</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.coupons.map(c => `
              <tr>
                <td>
                  <strong style="color: var(--accent-gold); font-size: 1.05rem; font-family: monospace;">${c.code}</strong>
                </td>
                <td>
                  ${c.freeShipping ? '🚀 Free Shipping' : `💰 ${c.discountPercent}% OFF`}
                </td>
                <td>PKR ${c.minSpend.toLocaleString()}</td>
                <td>
                  <span class="badge ${c.isActive ? 'badge-green' : 'badge-gold'}">
                    ${c.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-secondary btn-toggle-coupon" data-code="${c.code}" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;">
                    ${c.isActive ? 'Disable' : 'Activate'}
                  </button>
                  <button class="btn btn-outline-gold btn-delete-coupon" data-code="${c.code}" style="padding: 0.4rem 0.8rem; font-size: 0.78rem; color: var(--accent-neon);">
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

  if (activeTab === 'settings') {
    const pay = state.paymentSettings;
    return `
      <div style="max-width: 800px; display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.5rem;">
          <h3 style="color: var(--accent-gold); font-size: 1.1rem; margin-bottom: 1rem;">📱 JazzCash Account Settings</h3>
          <form id="jazzcash-settings-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label class="form-label">Account Title</label>
                <input type="text" name="jazzcashTitle" value="${pay.jazzcash.title}" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">JazzCash Mobile Number</label>
                <input type="text" name="jazzcashNumber" value="${pay.jazzcash.number}" class="form-input" required />
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="padding: 0.6rem 1.2rem; font-size: 0.85rem;">
              Save JazzCash Settings
            </button>
          </form>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.5rem;">
          <h3 style="color: var(--accent-gold); font-size: 1.1rem; margin-bottom: 1rem;">📲 EasyPaisa Account Settings</h3>
          <form id="easypaisa-settings-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label class="form-label">Account Title</label>
                <input type="text" name="easypaisaTitle" value="${pay.easypaisa.title}" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">EasyPaisa Mobile Number</label>
                <input type="text" name="easypaisaNumber" value="${pay.easypaisa.number}" class="form-input" required />
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="padding: 0.6rem 1.2rem; font-size: 0.85rem;">
              Save EasyPaisa Settings
            </button>
          </form>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.5rem;">
          <h3 style="color: var(--accent-gold); font-size: 1.1rem; margin-bottom: 1rem;">🏦 Pakistani Bank Transfer Settings</h3>
          <form id="bank-settings-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label class="form-label">Bank Name</label>
                <input type="text" name="bankName" value="${pay.bank.bankName}" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Account Title</label>
                <input type="text" name="bankTitle" value="${pay.bank.title}" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">IBAN Number</label>
                <input type="text" name="bankIban" value="${pay.bank.iban}" class="form-input" required />
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="padding: 0.6rem 1.2rem; font-size: 0.85rem;">
              Save Bank Details
            </button>
          </form>
        </div>
      </div>
    `;
  }
}

/**
 * Renders SVG 24-Hour (1h to 24h) Hourly Sales Performance Line Chart
 */
function render24HourSVGChart(orders) {
  const hourlyData = Array(24).fill(0);
  const now = Date.now();
  const oneDayAgo = now - 24 * 3600 * 1000;

  orders.forEach(order => {
    if (order.status === 'Cancelled') return;
    const orderTime = order.timestamp || (new Date(order.date).getTime());
    if (orderTime >= oneDayAgo) {
      const hoursAgo = Math.floor((now - orderTime) / (3600 * 1000));
      if (hoursAgo >= 0 && hoursAgo < 24) {
        const hourIndex = 23 - hoursAgo;
        hourlyData[hourIndex] += order.total;
      }
    }
  });

  const maxVal = Math.max(...hourlyData, 10000);
  const chartHeight = 180;
  const chartWidth = 900;
  const paddingX = 40;
  const paddingY = 20;

  const points = hourlyData.map((val, idx) => {
    const x = paddingX + (idx / 23) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (val / maxVal) * (chartHeight - paddingY * 2);
    return `${x},${y}`;
  }).join(' ');

  const currentHour = new Date().getHours();
  const labels = Array(24).fill(0).map((_, idx) => {
    const hour = (currentHour - (23 - idx) + 24) % 24;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return `
    <div style="width: 100%; overflow-x: auto;">
      <svg viewBox="0 0 ${chartWidth} ${chartHeight + 35}" style="width: 100%; height: auto; min-width: 600px; background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent-gold)" stop-opacity="0.4" />
            <stop offset="100%" stop-color="var(--accent-gold)" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <polyline
          fill="url(#salesGrad)"
          stroke="none"
          points="${paddingX},${chartHeight - paddingY} ${points} ${chartWidth - paddingX},${chartHeight - paddingY}"
        />

        <polyline
          fill="none"
          stroke="var(--accent-gold)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          points="${points}"
        />

        ${hourlyData.map((val, idx) => {
          const x = paddingX + (idx / 23) * (chartWidth - paddingX * 2);
          const y = chartHeight - paddingY - (val / maxVal) * (chartHeight - paddingY * 2);
          return `
            <circle cx="${x}" cy="${y}" r="4" fill="var(--accent-gold)" stroke="#000" stroke-width="1.5" />
            ${idx % 3 === 0 ? `
              <text x="${x}" y="${chartHeight + 20}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-family="sans-serif">
                ${labels[idx]}
              </text>
            ` : ''}
          `;
        }).join('')}
      </svg>
    </div>
  `;
}

function renderOrdersTable(orders) {
  if (!orders || orders.length === 0) {
    return `
      <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 3rem; text-align: center; border-radius: var(--radius-md);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📦</div>
        <h4 style="color: #fff; font-size: 1.1rem;">No orders received yet</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Storefront customer orders will appear here automatically in real time.</p>
      </div>
    `;
  }

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
          ${orders.map(o => `
            <tr>
              <td>
                <strong style="color: #ffffff; font-size: 0.95rem; font-family: monospace;">#${o.id}</strong>
                <div style="font-size: 0.75rem; color: var(--accent-gold);">${o.trackingNo}</div>
              </td>
              <td>
                <strong style="color: #fff; font-size: 0.9rem;">${o.customerName}</strong>
                <div style="font-size: 0.78rem; color: var(--text-muted);">${o.phone}</div>
              </td>
              <td>
                <strong style="color: #fff; font-size: 0.88rem;">${o.city}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${o.address}</div>
              </td>
              <td>
                <span class="badge badge-gold" style="font-weight: 700;">${o.courier ? o.courier.toUpperCase() : 'TRAX'}</span>
              </td>
              <td>
                <strong style="color: var(--accent-gold); font-size: 1.05rem;">PKR ${o.total.toLocaleString()}</strong>
              </td>
              <td>
                <div style="font-size: 0.82rem; color: #fff;">${o.paymentMethod}</div>
                ${o.paymentProof ? `
                  <button class="btn btn-secondary btn-view-proof" data-proof="${o.paymentProof}" data-id="${o.id}" style="padding: 0.2rem 0.6rem; font-size: 0.72rem; margin-top: 0.3rem;">
                    🖼️ View Proof
                  </button>
                ` : `<span style="font-size: 0.72rem; color: var(--text-muted);">No Proof File</span>`}
              </td>
              <td>
                <select class="form-select order-status-select" data-id="${o.id}" style="padding: 0.3rem 0.5rem; font-size: 0.8rem; background: var(--bg-primary); color: #fff; border: 1px solid var(--border-gold); border-radius: 4px;">
                  <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                  <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                  <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
              </td>
              <td>
                <button class="btn btn-secondary btn-print-slip" data-id="${o.id}" style="padding: 0.35rem 0.7rem; font-size: 0.75rem;">
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
  // Update Order Status
  container.querySelectorAll('.order-status-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const orderId = select.dataset.id;
      const newStatus = e.target.value;
      appStore.updateOrderStatus(orderId, newStatus);
    });
  });

  // View Payment Proof Modal
  container.querySelectorAll('.btn-view-proof').forEach(btn => {
    btn.addEventListener('click', () => {
      const proofSrc = btn.dataset.proof;
      const orderId = btn.dataset.id;
      const proofRoot = container.querySelector('#admin-proof-modal-root');
      if (proofRoot) {
        proofRoot.classList.add('active');
        proofRoot.innerHTML = `
          <div class="modal-card" style="max-width: 600px; padding: 2rem; background: var(--bg-card); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md);">
            <button class="modal-close-btn" id="btn-close-proof">✕</button>
            <h3 style="color: var(--accent-gold); margin-bottom: 1rem;">📸 Payment Transfer Proof Screenshot (Order #${orderId})</h3>
            <div style="background: #000; padding: 1rem; border-radius: var(--radius-sm); text-align: center;">
              <img src="${proofSrc}" alt="Payment Proof" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 6px; border: 1px solid var(--border-gold);" />
            </div>
            <div style="margin-top: 1rem; text-align: right;">
              <button class="btn btn-primary" id="btn-close-proof-footer">Done</button>
            </div>
          </div>
        `;

        proofRoot.querySelector('#btn-close-proof')?.addEventListener('click', () => proofRoot.classList.remove('active'));
        proofRoot.querySelector('#btn-close-proof-footer')?.addEventListener('click', () => proofRoot.classList.remove('active'));
      }
    });
  });

  // Delete Product Trigger
  container.querySelectorAll('.btn-delete-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (confirm(`Are you sure you want to delete product SKU: ${id}?`)) {
        appStore.deleteProduct(id);
        renderAdminDashboard(container, appStore.state);
      }
    });
  });

  // Edit Product Trigger
  container.querySelectorAll('.btn-edit-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      editingProduct = state.products.find(p => p.id === id);
      uploadedImages = editingProduct ? [...(editingProduct.images || [])] : [];
      openProductEditModal(container, state);
    });
  });

  // Toggle & Delete Coupons
  container.querySelectorAll('.btn-toggle-coupon').forEach(btn => {
    btn.addEventListener('click', () => {
      appStore.toggleCoupon(btn.dataset.code);
      renderAdminDashboard(container, appStore.state);
    });
  });

  container.querySelectorAll('.btn-delete-coupon').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm(`Delete coupon code ${btn.dataset.code}?`)) {
        appStore.deleteCoupon(btn.dataset.code);
        renderAdminDashboard(container, appStore.state);
      }
    });
  });
}

function openProductEditModal(container, state) {
  const root = container.querySelector('#admin-product-modal-root');
  if (!root) return;

  const isEdit = !!editingProduct;
  const prod = editingProduct || {
    name: '', category: 'shoes', price: '', originalPrice: '', stock: 20, color: '', sizes: ['M', 'L'], description: ''
  };

  root.classList.add('active');
  root.innerHTML = `
    <div class="modal-card" style="max-width: 650px; padding: 2rem; background: var(--bg-card); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md);">
      <button class="modal-close-btn" id="btn-close-prod-modal">✕</button>
      <h2 style="font-size: 1.4rem; color: var(--accent-gold); margin-bottom: 1.5rem;">
        ${isEdit ? '✏️ Edit Catalog Item' : '➕ Add New SKU Product'}
      </h2>

      <form id="admin-prod-form">
        <div class="form-group">
          <label class="form-label">Product Name *</label>
          <input type="text" name="name" value="${prod.name}" required class="form-input" placeholder="e.g. Nike Air Jordan 1 Low" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select name="category" class="form-select">
              <option value="shoes" ${prod.category === 'shoes' ? 'selected' : ''}>Shoes</option>
              <option value="tshirts" ${prod.category === 'tshirts' ? 'selected' : ''}>T-Shirts</option>
              <option value="trousers" ${prod.category === 'trousers' ? 'selected' : ''}>Trousers</option>
              <option value="pants" ${prod.category === 'pants' ? 'selected' : ''}>Pants</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Price (PKR) *</label>
            <input type="number" name="price" value="${prod.price}" required class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Stock Qty *</label>
            <input type="number" name="stock" value="${prod.stock}" required class="form-input" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Main Image URL *</label>
          <input type="url" name="imageUrl" value="${uploadedImages[0] || ''}" required class="form-input" placeholder="https://images.unsplash.com/..." />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea name="description" class="form-input" rows="3">${prod.description || ''}</textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-prod-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Product</button>
        </div>
      </form>
    </div>
  `;

  root.querySelector('#btn-close-prod-modal')?.addEventListener('click', () => root.classList.remove('active'));
  root.querySelector('#btn-cancel-prod-modal')?.addEventListener('click', () => root.classList.remove('active'));

  const form = root.querySelector('#admin-prod-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const prodData = {
      id: isEdit ? editingProduct.id : `prod-${Date.now()}`,
      name: fd.get('name'),
      category: fd.get('category'),
      price: parseFloat(fd.get('price')),
      stock: parseInt(fd.get('stock')),
      images: [fd.get('imageUrl')],
      description: fd.get('description'),
      inStock: parseInt(fd.get('stock')) > 0
    };

    appStore.saveProduct(prodData);
    root.classList.remove('active');
    renderAdminDashboard(container, appStore.state);
  });
}

function openCouponModal(container, state) {
  const root = container.querySelector('#admin-coupon-modal-root');
  if (!root) return;

  root.classList.add('active');
  root.innerHTML = `
    <div class="modal-card" style="max-width: 500px; padding: 2rem; background: var(--bg-card); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md);">
      <button class="modal-close-btn" id="btn-close-coupon-modal">✕</button>
      <h2 style="font-size: 1.4rem; color: var(--accent-gold); margin-bottom: 1.5rem;">🎟️ Create Promo Coupon Code</h2>

      <form id="admin-coupon-form">
        <div class="form-group">
          <label class="form-label">Coupon Code *</label>
          <input type="text" name="code" required class="form-input" placeholder="e.g. KREID20" style="text-transform: uppercase;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Discount %</label>
            <input type="number" name="discountPercent" value="15" min="1" max="100" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Min Order PKR</label>
            <input type="number" name="minSpend" value="3000" class="form-input" />
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-coupon-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Coupon</button>
        </div>
      </form>
    </div>
  `;

  root.querySelector('#btn-close-coupon-modal')?.addEventListener('click', () => root.classList.remove('active'));
  root.querySelector('#btn-cancel-coupon-modal')?.addEventListener('click', () => root.classList.remove('active'));

  const form = root.querySelector('#admin-coupon-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const couponData = {
      code: fd.get('code'),
      discountPercent: parseFloat(fd.get('discountPercent')) || 0,
      minSpend: parseFloat(fd.get('minSpend')) || 0,
      isActive: true
    };

    appStore.saveCoupon(couponData);
    root.classList.remove('active');
    renderAdminDashboard(container, appStore.state);
  });
}
