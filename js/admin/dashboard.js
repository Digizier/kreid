/**
 * KREID Administrative Control Suite Dashboard
 * Integrated 127+ Pakistani City-by-City Custom Shipping Rate Manager, Today's High-Tech Live Hourly Sales Graph with Y-Axis & Peak Value Badges, Admin Authentication Guard (kreid/kreid123@#), Advanced Product Editor, and "DELETE" Confirmation Wiping.
 */

import { appStore } from '../store/appStore.js';
import { renderWhatsAppManager } from './whatsappManager.js';
import { renderEmailManager } from './emailManager.js';
import { emailService } from '../services/emailService.js';
import { majorMetroCities, allPakistanCities } from '../data/pakistanCities.js';

let activeTab = 'dashboard'; // 'dashboard' | 'products' | 'orders' | 'whatsapp' | 'email' | 'coupons' | 'cityrates' | 'settings'

let editingProduct = null;
let uploadedImages = [];

export function renderAdminDashboard(container, state) {
  // Security Guard: Check Admin Authentication
  if (!state.isAdminAuthenticated) {
    renderAdminLoginScreen(container);
    return;
  }

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
          <div class="menu-item ${activeTab === 'cityrates' ? 'active' : ''}" data-tab="cityrates">
            🏙️ City Delivery Rates (127)
          </div>
          <div class="menu-item ${activeTab === 'whatsapp' ? 'active' : ''}" data-tab="whatsapp">
            📱 WhatsApp Automation
          </div>
          <div class="menu-item ${activeTab === 'email' ? 'active' : ''}" data-tab="email">
            📧 Email Automation
          </div>

          <div class="menu-item ${activeTab === 'coupons' ? 'active' : ''}" data-tab="coupons">
            🎟️ Discount Coupons (${state.coupons.length})
          </div>
          <div class="menu-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
            ⚙️ Payment Accounts Settings
          </div>
        </nav>

        <div style="margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--border-light); display: flex; flex-direction: column; gap: 0.6rem;">
          <button class="btn btn-outline-gold" id="btn-admin-logout" style="width: 100%; font-size: 0.8rem; border-color: rgba(230,57,70,0.5); color: var(--accent-neon);">
            🔒 Logout Admin Session
          </button>
          <button class="btn btn-secondary" id="btn-admin-go-store" style="width: 100%; font-size: 0.8rem;">
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
              ${activeTab === 'dashboard' ? "Executive Overview & Today's Live Sales Analytics" :
                activeTab === 'products' ? 'Advanced Product Catalog Manager' :
                activeTab === 'orders' ? 'Order Fulfillment & Payment Proof Inspector' :
                activeTab === 'cityrates' ? '127+ Pakistani Cities Custom Shipping Rates' :
                activeTab === 'whatsapp' ? 'WhatsApp Automation & Dual-Gateway Suite' :
                activeTab === 'email' ? 'Resend Email Automation & Dispatcher Suite' :
                activeTab === 'coupons' ? 'Promotions & Coupons Engine' : 'Payment Accounts Settings'}
            </h1>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Connected Live to KREID Storefront Data Engine
            </p>
          </div>

          <div style="display: flex; gap: 0.8rem; align-items: center;">
            ${activeTab === 'products' ? `
              <button class="btn btn-primary" id="btn-open-add-product-modal">
                + Add Advanced SKU Product
              </button>
            ` : ''}
            ${activeTab === 'orders' ? `
              <button class="btn" id="btn-trigger-wipe-orders" style="background: rgba(230, 57, 70, 0.15); border: 1.5px solid var(--accent-neon); color: var(--accent-neon); font-weight: 800; padding: 0.6rem 1.1rem; border-radius: var(--radius-sm); cursor: pointer;">
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
          : activeTab === 'email'
          ? '<div id="email-tab-container"></div>'
          : renderTabContent(state, totalRevenue, totalOrders, totalProducts, lowStockCount)}


      </main>
    </div>

    <!-- Modals Roots -->
    <div id="admin-product-modal-root" class="modal-overlay"></div>
    <div id="admin-coupon-modal-root" class="modal-overlay"></div>
    <div id="admin-order-modal-root" class="modal-overlay"></div>
    <div id="admin-proof-modal-root" class="modal-overlay"></div>
    <div id="admin-delete-confirm-modal-root" class="modal-overlay"></div>
  `;

  if (activeTab === 'whatsapp') {
    const waContainer = container.querySelector('#whatsapp-tab-container');
    if (waContainer) renderWhatsAppManager(waContainer, state);
  }

  if (activeTab === 'email') {
    const emailContainer = container.querySelector('#email-tab-container');
    if (emailContainer) renderEmailManager(emailContainer, state);
  }


  // Attach Sidebar Listeners
  const menuItems = container.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      activeTab = item.dataset.tab;
      renderAdminDashboard(container, state);
    });
  });

  container.querySelector('#btn-admin-logout')?.addEventListener('click', () => {
    appStore.logoutAdmin();
  });

  container.querySelector('#btn-admin-go-store')?.addEventListener('click', () => {
    window.location.hash = '';
    appStore.setView('storefront');
  });

  // Product Add Trigger
  container.querySelector('#btn-open-add-product-modal')?.addEventListener('click', () => {
    editingProduct = null;
    uploadedImages = [];
    openProductEditModal(container, state);
  });

  // Wipe Orders Confirmation Modal Trigger
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

  // Coupon Add Trigger
  container.querySelector('#btn-open-add-coupon-modal')?.addEventListener('click', () => {
    openCouponModal(container, state);
  });

  // City Shipping Rates Tab Event Handlers
  if (activeTab === 'cityrates') {
    const citySearchInput = container.querySelector('#input-search-city-rates');
    citySearchInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      container.querySelectorAll('.city-rate-row').forEach(row => {
        const cityName = row.dataset.city;
        if (cityName.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });

    container.querySelectorAll('.btn-save-single-city').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.dataset.city;
        const input = container.querySelector(`.city-rate-input[data-city="${city}"]`);
        if (input) {
          appStore.saveCityShippingRate(city, input.value);
        }
      });
    });

    container.querySelector('#btn-save-all-city-rates')?.addEventListener('click', () => {
      const ratesMap = {};
      container.querySelectorAll('.city-rate-input').forEach(input => {
        ratesMap[input.dataset.city] = parseFloat(input.value) || 250;
      });

      const extraItemInput = container.querySelector('#input-additional-product-fee');
      if (extraItemInput) {
        const extraFee = parseFloat(extraItemInput.value) || 50;
        appStore.saveShippingConfig({ additionalItemFee: extraFee });
      }

      appStore.saveAllCityShippingRates(ratesMap);
    });
  }

  attachTableEventListeners(container, state);
}

function renderAdminLoginScreen(container) {
  container.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); padding: 1.5rem;">
      <div style="background: var(--bg-card); border: 2px solid var(--accent-gold); border-radius: var(--radius-md); width: 100%; max-width: 440px; padding: 2.5rem; box-shadow: 0 30px 80px rgba(0,0,0,0.9); position: relative;">
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <img src="assets/kreid-logo.svg" alt="KREID COUTURE" style="height: 60px; margin-bottom: 0.8rem;" />
          <h2 style="font-size: 1.5rem; color: #ffffff; margin-bottom: 0.3rem;">ADMIN CONTROL SUITE</h2>
          <p style="font-size: 0.82rem; color: var(--text-muted);">Enter admin authentication credentials to unlock dashboard</p>
        </div>

        <form id="admin-login-form" autocomplete="off">
          <div class="form-group">
            <label class="form-label" style="color: var(--accent-gold); font-weight: 700;">Admin Username *</label>
            <input type="text" name="username" required placeholder="Enter admin username" class="form-input" style="padding: 0.8rem; font-size: 1rem; border-color: var(--border-gold);" value="" autocomplete="off" />
          </div>

          <div class="form-group" style="margin-bottom: 1.8rem;">
            <label class="form-label" style="color: var(--accent-gold); font-weight: 700;">Admin Security Password *</label>
            <input type="password" name="password" required placeholder="Enter admin password" class="form-input" style="padding: 0.8rem; font-size: 1rem; border-color: var(--border-gold);" value="" autocomplete="new-password" />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1rem; font-weight: 800;">
            🔒 Authenticate & Unlock Admin Dashboard
          </button>
        </form>


        <div style="margin-top: 1.5rem; text-align: center;">
          <button class="btn btn-secondary" id="btn-login-go-store" style="font-size: 0.82rem; padding: 0.5rem 1rem;">
            🛍️ Return to Customer Storefront
          </button>
        </div>

      </div>
    </div>
  `;

  const form = container.querySelector('#admin-login-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const user = fd.get('username').trim();
    const pass = fd.get('password').trim();

    if (appStore.loginAdmin(user, pass)) {
      renderAdminDashboard(container, appStore.state);
    }
  });

  container.querySelector('#btn-login-go-store')?.addEventListener('click', () => {
    window.location.hash = '';
    appStore.setView('storefront');
  });
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

      <!-- High-Tech Professional Today's Live Sales Analytics SVG Graph (00:00 - 23:59) -->
      <div class="chart-container" style="background: var(--bg-card); border: 1.5px solid var(--border-gold); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: 0 15px 40px rgba(0,0,0,0.6); position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
          <div>
            <h3 style="font-size: 1.15rem; color: var(--accent-gold); font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <span>📈</span> Today's Live Hourly Sales Performance Graph (00:00 - 23:59)
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">
              Real-time hourly sales breakdown (PKR) calculated strictly from TODAY'S customer storefront orders
            </p>
          </div>
          <span class="badge badge-green" style="font-weight: 800; letter-spacing: 0.05em; padding: 0.5rem 0.9rem;">
            🟢 TODAY LIVE (00:00 - 23:59)
          </span>
        </div>

        ${renderTodayLiveSVGChart(state.orders)}
      </div>

      <!-- Recent Live Orders -->
      <h3 style="font-size: 1.2rem; margin-bottom: 1rem; margin-top: 1.8rem;">Recent Customer Orders</h3>
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
              <th>Product Details</th>
              <th>Category</th>
              <th>Price (PKR)</th>
              <th>Stock</th>
              <th>Badge</th>
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
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Model: ${p.model || 'N/A'} | Color: ${p.color || 'N/A'} | Sizes: ${p.sizes ? p.sizes.join(', ') : 'N/A'}</div>
                </td>
                <td><span class="badge badge-gold">${p.category.toUpperCase()}</span></td>
                <td>
                  <strong style="color: var(--accent-gold); font-size: 1rem;">PKR ${p.price.toLocaleString()}</strong>
                  ${p.originalPrice ? `<div style="font-size: 0.72rem; color: var(--text-muted); text-decoration: line-through;">PKR ${p.originalPrice.toLocaleString()}</div>` : ''}
                </td>
                <td><strong>${p.stock}</strong></td>
                <td>
                  <span class="badge badge-green">${p.badge || 'HOT'}</span>
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

  if (activeTab === 'cityrates') {
    const ratesMap = state.cityShippingRates || {};
    const addFee = (state.shippingConfig && state.shippingConfig.additionalItemFee !== undefined) ? state.shippingConfig.additionalItemFee : 50;

    return `
      <!-- City Rates Manager Top Banner & Consolidated Extra Item Fee Input -->
      <div style="background: var(--bg-card); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div>
          <h3 style="color: var(--accent-gold); font-size: 1.25rem; font-weight: 800; margin-bottom: 0.3rem;">
            🏙️ Consolidated 127+ Pakistani Cities Shipping Manager
          </h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">
            Set exact delivery rates per Pakistani city + fee for extra products added to cart.
          </p>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-gold); padding: 0.5rem 0.9rem; border-radius: var(--radius-sm); display: flex; align-items: center; gap: 0.6rem;">
            <label style="font-size: 0.82rem; color: #fff; font-weight: 700;">➕ Additional Product Fee:</label>
            <span style="font-size: 0.82rem; color: var(--accent-gold); font-weight: 800;">PKR</span>
            <input type="number" id="input-additional-product-fee" value="${addFee}" min="0" max="500" style="width: 75px; padding: 0.3rem; background: var(--bg-primary); border: 1px solid var(--border-gold); color: #fff; border-radius: 4px; font-weight: 800; text-align: center;" />
          </div>

          <input type="text" id="input-search-city-rates" placeholder="🔍 Filter City (e.g. Karachi, Lahore)..." style="padding: 0.6rem 1rem; width: 230px; background: var(--bg-primary); border: 1px solid var(--border-gold); color: #fff; border-radius: var(--radius-sm); font-size: 0.85rem;" />
          
          <button id="btn-save-all-city-rates" class="btn btn-primary" style="padding: 0.6rem 1.2rem; font-size: 0.85rem; font-weight: 800; white-space: nowrap;">
            💾 SAVE ALL 127 CITY RATES
          </button>
        </div>
      </div>

      <!-- 127 Cities Rate Table -->
      <div class="admin-table-wrap">
        <form id="city-shipping-rates-form">
          <table class="admin-table">
            <thead>
              <tr>
                <th>City Name</th>
                <th>Region / Tier Badge</th>
                <th>Custom Delivery Rate (PKR)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="city-rates-table-body">
              ${allPakistanCities.map(city => {
                const currentRate = ratesMap[city] !== undefined ? ratesMap[city] : (majorMetroCities.includes(city) ? 150 : 250);
                const isMetro = majorMetroCities.includes(city);
                return `
                  <tr class="city-rate-row" data-city="${city.toLowerCase()}">
                    <td>
                      <strong style="color: #ffffff; font-size: 1rem;">${city}</strong>
                    </td>
                    <td>
                      <span class="badge ${isMetro ? 'badge-green' : 'badge-gold'}">
                        ${isMetro ? '🌟 MAJOR METROPOLITAN HUB' : '📍 REGIONAL CITY'}
                      </span>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 700;">PKR</span>
                        <input type="number" class="city-rate-input form-input" data-city="${city}" value="${currentRate}" min="0" max="2000" style="width: 110px; padding: 0.4rem 0.6rem; font-weight: 800; text-align: center; color: #fff; background: var(--bg-primary); border: 1px solid var(--border-gold);" />
                      </div>
                    </td>
                    <td>
                      <button type="button" class="btn btn-secondary btn-save-single-city" data-city="${city}" style="padding: 0.35rem 0.8rem; font-size: 0.78rem;">
                        💾 Save Rate
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </form>
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
      <div style="max-width: 850px; display: flex; flex-direction: column; gap: 1.5rem;">
        
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
 * Calculates and renders TODAY'S LIVE HOURLY SALES GRAPH WITH Y-AXIS CURRENCY SCALES AND PEAK VALUE BADGES (00:00 - 23:59)
 */
function renderTodayLiveSVGChart(orders) {
  const hourlyData = Array(24).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();
  const endOfToday = startOfToday + 24 * 3600 * 1000 - 1;

  orders.forEach(order => {
    if (order.status === 'Cancelled') return;
    const orderTime = order.timestamp || (new Date(order.date).getTime());
    if (orderTime >= startOfToday && orderTime <= endOfToday) {
      const hour = new Date(orderTime).getHours();
      if (hour >= 0 && hour < 24) {
        hourlyData[hour] += order.total;
      }
    }
  });

  const rawMax = Math.max(...hourlyData);
  const maxVal = rawMax > 0 ? Math.ceil(rawMax / 2000) * 2000 : 10000;
  const chartHeight = 220;
  const chartWidth = 920;
  const paddingLeft = 85;
  const paddingRight = 40;
  const paddingTop = 35;
  const paddingBottom = 35;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const points = hourlyData.map((val, idx) => {
    const x = paddingLeft + (idx / 23) * innerWidth;
    const y = chartHeight - paddingBottom - (val / maxVal) * innerHeight;
    return `${x},${y}`;
  }).join(' ');

  const labels = Array(24).fill(0).map((_, idx) => {
    return `${idx.toString().padStart(2, '0')}:00`;
  });

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  return `
    <div style="width: 100%; overflow-x: auto;">
      <svg viewBox="0 0 ${chartWidth} ${chartHeight + 20}" style="width: 100%; height: auto; min-width: 650px; background: rgba(0,0,0,0.4); border-radius: var(--radius-sm); border: 1px solid var(--border-gold);">
        <defs>
          <linearGradient id="todaySalesGradHighTech" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent-gold)" stop-opacity="0.5" />
            <stop offset="100%" stop-color="var(--accent-gold)" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Gridlines & Y-Axis Scale Labels -->
        ${yTicks.map(tickVal => {
          const y = chartHeight - paddingBottom - (tickVal / maxVal) * innerHeight;
          return `
            <line x1="${paddingLeft}" y1="${y}" x2="${chartWidth - paddingRight}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4 4" />
            <text x="${paddingLeft - 10}" y="${y + 4}" fill="var(--accent-gold)" font-size="10" text-anchor="end" font-weight="700" font-family="monospace">
              PKR ${Math.round(tickVal).toLocaleString()}
            </text>
          `;
        }).join('')}

        <!-- Gradient Fill under Polyline -->
        <polyline
          fill="url(#todaySalesGradHighTech)"
          stroke="none"
          points="${paddingLeft},${chartHeight - paddingBottom} ${points} ${chartWidth - paddingRight},${chartHeight - paddingBottom}"
        />

        <!-- Glowing Polyline -->
        <polyline
          fill="none"
          stroke="var(--accent-gold)"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          points="${points}"
        />

        <!-- Data Nodes & Peak Value Badges -->
        ${hourlyData.map((val, idx) => {
          const x = paddingLeft + (idx / 23) * innerWidth;
          const y = chartHeight - paddingBottom - (val / maxVal) * innerHeight;
          const hasSales = val > 0;

          return `
            <g class="chart-node-group">
              <title>⏰ Hour: ${labels[idx]} | Sales: PKR ${val.toLocaleString()}</title>
              
              <!-- Circle Node -->
              <circle cx="${x}" cy="${y}" r="${hasSales ? 6 : 3.5}" fill="${hasSales ? 'var(--accent-gold)' : '#555'}" stroke="#000" stroke-width="2" />

              ${hasSales ? `
                <!-- Value Badge Label Above Data Node -->
                <rect x="${x - 38}" y="${y - 28}" width="76" height="18" rx="4" fill="rgba(212,175,55,0.95)" />
                <text x="${x}" y="${y - 15}" fill="#000000" font-size="9.5" text-anchor="middle" font-weight="900" font-family="sans-serif">
                  PKR ${val.toLocaleString()}
                </text>
              ` : ''}

              <!-- X-Axis Hour Label -->
              ${idx % 3 === 0 ? `
                <text x="${x}" y="${chartHeight + 12}" fill="var(--text-muted)" font-size="10" text-anchor="middle" font-weight="700" font-family="monospace">
                  ${labels[idx]}
                </text>
              ` : ''}
            </g>
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
  container.querySelectorAll('.order-status-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const orderId = select.dataset.id;
      const newStatus = e.target.value;
      appStore.updateOrderStatus(orderId, newStatus);
    });
  });

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

  container.querySelectorAll('.btn-delete-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const targetProd = state.products.find(p => p.id === id);
      const deleteModalRoot = container.querySelector('#admin-delete-confirm-modal-root');
      if (deleteModalRoot && targetProd) {
        deleteModalRoot.classList.add('active');
        deleteModalRoot.innerHTML = `
          <div class="modal-card" style="max-width: 480px; padding: 2rem; background: var(--bg-card); border: 2px solid var(--accent-neon); border-radius: var(--radius-md); text-align: center;">
            <div style="font-size: 2.5rem; color: var(--accent-neon); margin-bottom: 0.4rem;">🗑️</div>
            <h3 style="color: #ffffff; font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">DELETE CATALOG PRODUCT SKU?</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.2rem;">
              Are you sure you want to permanently delete <strong>"${targetProd.name}"</strong> (SKU: ${id})?
            </p>
            <div style="display: flex; gap: 0.8rem;">
              <button class="btn btn-secondary" id="btn-cancel-delete-prod" style="flex: 1;">Cancel</button>
              <button class="btn" id="btn-confirm-delete-prod" style="flex: 1; background: var(--accent-neon); color: #fff; font-weight: 800; border: none;">Confirm Delete</button>
            </div>
          </div>
        `;

        deleteModalRoot.querySelector('#btn-cancel-delete-prod')?.addEventListener('click', () => deleteModalRoot.classList.remove('active'));
        deleteModalRoot.querySelector('#btn-confirm-delete-prod')?.addEventListener('click', () => {
          appStore.deleteProduct(id);
          deleteModalRoot.classList.remove('active');
          renderAdminDashboard(container, appStore.state);
        });
      }
    });
  });

  container.querySelectorAll('.btn-edit-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      editingProduct = state.products.find(p => p.id === id);
      uploadedImages = editingProduct ? [...(editingProduct.images || [])] : [];
      openProductEditModal(container, state);
    });
  });

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
    name: '', model: '', category: 'shoes', price: '', originalPrice: '', stock: 20, color: '', sizes: ['39', '40', '41', '42', '43', '44'], badge: 'BESTSELLER', description: ''
  };

  if (!uploadedImages || uploadedImages.length === 0) {
    uploadedImages = prod.images ? [...prod.images] : ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'];
  }

  root.classList.add('active');
  root.innerHTML = `
    <div class="modal-card" style="max-width: 780px; padding: 2rem; background: var(--bg-card); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md); max-height: 90vh; overflow-y: auto;">
      <button class="modal-close-btn" id="btn-close-prod-modal">✕</button>
      <h2 style="font-size: 1.4rem; color: var(--accent-gold); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.6rem;">
        ${isEdit ? '✏️ Edit Advanced Catalog Product' : '➕ Create New Advanced SKU Item'}
      </h2>

      <form id="admin-prod-form">
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem;">
          <h4 style="color: var(--accent-gold); font-size: 0.95rem; margin-bottom: 0.8rem;">1. Product Identity & Category</h4>
          
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label class="form-label">Product Name *</label>
              <input type="text" name="name" value="${prod.name}" required class="form-input" placeholder="e.g. Nike Air Jordan 1 Low – White/Wheat Black" />
            </div>

            <div class="form-group">
              <label class="form-label">Category *</label>
              <select name="category" id="modal-category-select" class="form-select">
                <option value="shoes" ${prod.category === 'shoes' ? 'selected' : ''}>Shoes</option>
                <option value="tshirts" ${prod.category === 'tshirts' ? 'selected' : ''}>T-Shirts</option>
                <option value="trousers" ${prod.category === 'trousers' ? 'selected' : ''}>Trousers</option>
                <option value="pants" ${prod.category === 'pants' ? 'selected' : ''}>Pants</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Model Name / Line</label>
              <input type="text" name="model" value="${prod.model || ''}" class="form-input" placeholder="e.g. Air Jordan 1 Low" />
            </div>

            <div class="form-group">
              <label class="form-label">Primary Color Variant</label>
              <input type="text" name="color" value="${prod.color || ''}" class="form-input" placeholder="e.g. White / Wheat Brown / Black" />
            </div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem;">
          <h4 style="color: var(--accent-gold); font-size: 0.95rem; margin-bottom: 0.8rem;">2. Pakistani Pricing & Stock Inventory</h4>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Discount Price (PKR) *</label>
              <input type="number" name="price" value="${prod.price}" required class="form-input" placeholder="e.g. 3500" />
            </div>

            <div class="form-group">
              <label class="form-label">Original Price (PKR)</label>
              <input type="number" name="originalPrice" value="${prod.originalPrice || ''}" class="form-input" placeholder="e.g. 4500" />
            </div>

            <div class="form-group">
              <label class="form-label">Inventory Qty *</label>
              <input type="number" name="stock" value="${prod.stock}" required class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Tag Badge</label>
              <select name="badge" class="form-select">
                <option value="BESTSELLER" ${prod.badge === 'BESTSELLER' ? 'selected' : ''}>BESTSELLER</option>
                <option value="HOT ITEM" ${prod.badge === 'HOT ITEM' ? 'selected' : ''}>HOT ITEM</option>
                <option value="EXCLUSIVE" ${prod.badge === 'EXCLUSIVE' ? 'selected' : ''}>EXCLUSIVE</option>
                <option value="LIMITED" ${prod.badge === 'LIMITED' ? 'selected' : ''}>LIMITED</option>
              </select>
            </div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem;">
          <h4 style="color: var(--accent-gold); font-size: 0.95rem; margin-bottom: 0.8rem;">
            📸 Product Multi-Image Upload & URL Gallery (Up to 4 Images)
          </h4>

          <div style="display: flex; flex-direction: column; gap: 0.8rem;">
            <label class="file-upload-box" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.4rem; padding: 1.2rem; background: var(--bg-primary); border: 2px dashed var(--border-gold); border-radius: 8px; cursor: pointer;">
              <span style="font-size: 1.8rem; color: var(--accent-gold);">📁</span>
              <strong style="color: #fff; font-size: 0.88rem;">Click to Upload Local Image Files or Drag-and-Drop</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Supports PNG, JPG, WEBP format</span>
              <input type="file" id="local-image-file-input" accept="image/*" multiple style="display: none;" />
            </label>

            <div style="display: flex; gap: 0.6rem;">
              <input type="url" id="input-add-image-url" class="form-input" placeholder="Or paste external image URL (e.g. https://images.unsplash.com/...)" />
              <button type="button" id="btn-add-image-url-trigger" class="btn btn-secondary" style="font-size: 0.82rem; padding: 0.5rem 1rem; white-space: nowrap;">
                + Add Image URL
              </button>
            </div>

            <div id="product-images-preview-tray" style="display: flex; gap: 0.8rem; flex-wrap: wrap; margin-top: 0.6rem;">
              <!-- Dynamic Previews Injected Here -->
            </div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: var(--radius-sm); margin-bottom: 1.2rem;">
          <h4 style="color: var(--accent-gold); font-size: 0.95rem; margin-bottom: 0.8rem;">4. Sizes Checklist & Product Specifications</h4>

          <div class="form-group">
            <label class="form-label">Available Sizes (Comma Separated)</label>
            <input type="text" name="sizes" value="${prod.sizes ? prod.sizes.join(', ') : '39, 40, 41, 42, 43, 44'}" class="form-input" placeholder="e.g. 39, 40, 41, 42, 43, 44 OR S, M, L, XL" />
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Detailed Description</label>
            <textarea name="description" class="form-input" rows="3" placeholder="Write luxury product description...">${prod.description || ''}</textarea>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-prod-modal">Cancel</button>
          <button type="submit" class="btn btn-primary" style="padding: 0.7rem 1.4rem;">
            💾 Save Product to Inventory
          </button>
        </div>
      </form>
    </div>
  `;

  root.querySelector('#btn-close-prod-modal')?.addEventListener('click', () => root.classList.remove('active'));
  root.querySelector('#btn-cancel-prod-modal')?.addEventListener('click', () => root.classList.remove('active'));

  const previewTray = root.querySelector('#product-images-preview-tray');
  function updateImagePreviews() {
    if (!previewTray) return;
    previewTray.innerHTML = uploadedImages.map((img, idx) => `
      <div style="position: relative; width: 85px; height: 85px; border-radius: 6px; overflow: hidden; border: 1.5px solid var(--border-gold);">
        <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" />
        <button type="button" class="btn-remove-img-thumb" data-idx="${idx}" style="position: absolute; top: 2px; right: 2px; background: rgba(230,57,70,0.85); color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>
    `).join('');

    previewTray.querySelectorAll('.btn-remove-img-thumb').forEach(btn => {
      btn.addEventListener('click', () => {
        const removeIdx = parseInt(btn.dataset.idx);
        uploadedImages.splice(removeIdx, 1);
        updateImagePreviews();
      });
    });
  }

  updateImagePreviews();

  const fileInput = root.querySelector('#local-image-file-input');
  fileInput?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadedImages.push(evt.target.result);
        updateImagePreviews();
      };
      reader.readAsDataURL(file);
    });
  });

  const urlInput = root.querySelector('#input-add-image-url');
  root.querySelector('#btn-add-image-url-trigger')?.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
      uploadedImages.push(url);
      urlInput.value = '';
      updateImagePreviews();
    }
  });

  const form = root.querySelector('#admin-prod-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const sizesStr = fd.get('sizes');
    const sizesArray = sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(Boolean) : ['M', 'L'];

    const prodData = {
      id: isEdit ? editingProduct.id : `prod-${Date.now()}`,
      name: fd.get('name'),
      model: fd.get('model'),
      color: fd.get('color'),
      category: fd.get('category'),
      price: parseFloat(fd.get('price')),
      originalPrice: fd.get('originalPrice') ? parseFloat(fd.get('originalPrice')) : null,
      stock: parseInt(fd.get('stock')),
      badge: fd.get('badge'),
      images: uploadedImages.length > 0 ? uploadedImages : ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'],
      sizes: sizesArray,
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
