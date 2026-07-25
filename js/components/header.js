/**
 * Header Component for KREID Storefront
 */

import { appStore } from '../store/appStore.js';

export function renderHeader(container, state) {
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = state.wishlist.length;

  container.innerHTML = `
    <!-- Top Ticker Bar -->
    <div class="announcement-bar">
      <div class="container">
        <span>⚡ FLASH SALE: Up to 40% OFF on Jordan & Streetwear Collection | Free Shipping across Pakistan over PKR 5,000 | Cash on Delivery Available</span>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="site-header">
      <div class="container header-inner">
        <!-- Brand Logo Image -->
        <a href="#" class="brand-logo" id="logo-home" style="display: flex; align-items: center; gap: 0.8rem;">
          <img src="assets/kreid-logo.svg" alt="KREID COUTURE" style="height: 52px; filter: drop-shadow(0 2px 8px rgba(212,175,55,0.3));" />
        </a>

        <!-- Navigation Links -->
        <nav class="main-nav">
          <a href="#" class="nav-link ${state.activeCategory === 'all' ? 'active' : ''}" data-category="all">All Items</a>
          <a href="#" class="nav-link ${state.activeCategory === 'shoes' ? 'active' : ''}" data-category="shoes">Shoes</a>
          <a href="#" class="nav-link ${state.activeCategory === 'tshirts' ? 'active' : ''}" data-category="tshirts">T-Shirts</a>
          <a href="#" class="nav-link ${state.activeCategory === 'trousers' ? 'active' : ''}" data-category="trousers">Trousers</a>
          <a href="#" class="nav-link ${state.activeCategory === 'pants' ? 'active' : ''}" data-category="pants">Pants</a>
        </nav>

        <!-- Right Action Tray -->
        <div class="header-actions">
          <!-- Search Icon -->
          <button class="action-btn" id="btn-open-search" title="Search Catalog">
            🔍
          </button>

          <!-- Favorites / Wishlist Icon -->
          <button class="action-btn" id="btn-open-wishlist" title="Favorites">
            ❤️
            ${wishlistCount > 0 ? `<span class="badge-count">${wishlistCount}</span>` : ''}
          </button>

          <!-- Cart Icon -->
          <button class="action-btn" id="btn-open-cart" title="Shopping Cart">
            🛒
            ${cartCount > 0 ? `<span class="badge-count">${cartCount}</span>` : ''}
          </button>
        </div>
      </div>
    </header>
  `;

  // Attach Event Listeners
  const logoBtn = container.querySelector('#logo-home');
  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      appStore.setCategory('all');
    });
  }

  const navLinks = container.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.dataset.category;
      appStore.setCategory(cat);
    });
  });

  const cartBtn = container.querySelector('#btn-open-cart');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      appStore.toggleCart(true);
    });
  }

  const wishlistBtn = container.querySelector('#btn-open-wishlist');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      appStore.toggleWishlistModal(true);
    });
  }

  const searchBtn = container.querySelector('#btn-open-search');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query = prompt("Search KREID catalog (e.g. Jordan, Baggy, Air, 42):");
      if (query !== null) {
        appStore.setSearchQuery(query);
      }
    });
  }
}
