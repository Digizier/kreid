/**
 * Main Application Entry Point & Renderer
 * Connects central reactive store to DOM elements and components with URL routing for admin panel.
 */

import { appStore } from './store/appStore.js';
import { renderHeader } from './components/header.js';
import { renderHero } from './components/hero.js';
import { createProductCard } from './components/productCard.js';
import { renderProductModal } from './components/productModal.js';
import { renderCartDrawer } from './components/cartDrawer.js';
import { renderCheckoutModal } from './components/checkoutModal.js';
import { renderOrderTracker } from './components/orderTracker.js';
import { renderWishlistModal } from './components/wishlistModal.js';
import { renderSupportWidget } from './components/supportWidget.js';
import { renderAdminDashboard } from './admin/dashboard.js';

// DOM Roots
const headerRoot = document.getElementById('header-root');
const heroRoot = document.getElementById('hero-root');
const storefrontView = document.getElementById('storefront-view');
const adminView = document.getElementById('admin-view');
const productsGridRoot = document.getElementById('products-grid-root');
const productModalRoot = document.getElementById('product-modal-root');
const cartDrawerRoot = document.getElementById('cart-drawer-root');
const checkoutModalRoot = document.getElementById('checkout-modal-root');
const orderTrackerRoot = document.getElementById('order-tracker-root');
const wishlistModalRoot = document.getElementById('wishlist-modal-root');
const supportWidgetRoot = document.getElementById('support-widget-root');
const toastContainer = document.getElementById('toast-container');
const catalogTitle = document.getElementById('catalog-title');

// Initialize Constant Components
renderHero(heroRoot);
renderSupportWidget(supportWidgetRoot);

// Route Handler for /admin-kreid URL
function handleRouting() {
  const path = window.location.pathname;
  const hash = window.location.hash;
  const search = window.location.search;

  if (path.includes('admin-kreid') || hash.includes('admin-kreid') || search.includes('admin-kreid')) {
    if (appStore.state.view !== 'admin') {
      appStore.setView('admin');
    }
  } else {
    if (appStore.state.view !== 'storefront') {
      appStore.setView('storefront');
    }
  }
}

// Listen to Hash Change and Popstate
window.addEventListener('hashchange', handleRouting);
window.addEventListener('popstate', handleRouting);

// Check initial route
handleRouting();

// Timer countdown logic
setInterval(() => {
  const secsElem = document.getElementById('timer-secs');
  const minsElem = document.getElementById('timer-mins');
  if (secsElem && minsElem) {
    let s = parseInt(secsElem.innerText);
    if (s > 0) {
      secsElem.innerText = (s - 1).toString().padStart(2, '0');
    } else {
      secsElem.innerText = "59";
      let m = parseInt(minsElem.innerText);
      if (m > 0) minsElem.innerText = (m - 1).toString().padStart(2, '0');
    }
  }
}, 1000);

// Render Function Triggered on Store State Changes
function render(state) {
  // 1. View Mode Toggle (Storefront vs Admin)
  if (state.view === 'admin') {
    // Hide Storefront Header in Admin View!
    headerRoot.style.display = 'none';
    storefrontView.style.display = 'none';
    adminView.style.display = 'block';
    renderAdminDashboard(adminView, state);
  } else {
    // Show Storefront Header in Storefront View
    headerRoot.style.display = 'block';
    renderHeader(headerRoot, state);
    storefrontView.style.display = 'block';
    adminView.style.display = 'none';

    // Filter Products
    let filtered = state.products;

    if (state.activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === state.activeCategory);
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sizes && p.sizes.some(s => s.toLowerCase().includes(q))) ||
        (p.color && p.color.toLowerCase().includes(q))
      );
    }

    // Update Section Title & Active Search Notification Bar
    if (catalogTitle) {
      if (state.searchQuery) {
        catalogTitle.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 1rem;">
            <span>🔍 SEARCH RESULTS FOR "<span style="color: var(--accent-gold);">${state.searchQuery.toUpperCase()}</span>" (${filtered.length})</span>
            <button class="btn btn-secondary" id="btn-clear-main-search" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
              ✕ Clear Search Filter
            </button>
          </div>
        `;
        document.getElementById('btn-clear-main-search')?.addEventListener('click', () => {
          appStore.setSearchQuery('');
        });
      } else {
        catalogTitle.innerText = state.activeCategory === 'all' ? 'FEATURED PRODUCTS' : `${state.activeCategory.toUpperCase()} COLLECTION`;
      }
    }

    // Render Product Cards
    productsGridRoot.innerHTML = '';
    if (filtered.length === 0) {
      productsGridRoot.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted); background: var(--bg-card); border: 1px dashed var(--border-gold); border-radius: var(--radius-md);">
          <div style="font-size: 3.5rem; margin-bottom: 0.8rem;">🔍</div>
          <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.4rem;">No products found matching "${state.searchQuery || state.activeCategory}"</h3>
          <p style="font-size: 0.88rem; margin-bottom: 1.2rem;">Try checking your spelling or searching for another keyword.</p>
          <button class="btn btn-primary" id="btn-reset-filter">
            Show All Products
          </button>
        </div>
      `;
      document.getElementById('btn-reset-filter')?.addEventListener('click', () => {
        appStore.setCategory('all');
        appStore.setSearchQuery('');
      });
    } else {
      filtered.forEach(product => {
        const card = createProductCard(product);
        productsGridRoot.appendChild(card);
      });
    }
  }

  // 2. Render Overlays & Drawers
  renderProductModal(productModalRoot, state.activeProductModal);
  renderCartDrawer(cartDrawerRoot, state);
  renderCheckoutModal(checkoutModalRoot, state);
  renderOrderTracker(orderTrackerRoot, state);
  renderWishlistModal(wishlistModalRoot, state);

  // 3. Render Toasts
  renderToasts(toastContainer, state.toasts);
}

function renderToasts(container, toasts) {
  container.innerHTML = toasts.map(t => `
    <div class="toast ${t.type}">
      <span>${t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${t.message}</span>
    </div>
  `).join('');
}

// Track order header button listener
document.getElementById('btn-track-order-header')?.addEventListener('click', () => {
  appStore.toggleOrderTracker(true);
});

// Subscribe to store updates
appStore.subscribe(render);

// Initial Application Boot Render
render(appStore.state);
console.log("KREID COUTURE platform initialized successfully!");
