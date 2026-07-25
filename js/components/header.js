/**
 * Header Component for KREID Storefront
 * Featuring Premium Live Instant Search Overlay Modal with Real-Time Product Previews
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
          <a href="#" class="nav-link ${state.activeCategory === 'all' && !state.searchQuery ? 'active' : ''}" data-category="all">All Items</a>
          <a href="#" class="nav-link ${state.activeCategory === 'shoes' ? 'active' : ''}" data-category="shoes">Shoes</a>
          <a href="#" class="nav-link ${state.activeCategory === 'tshirts' ? 'active' : ''}" data-category="tshirts">T-Shirts</a>
          <a href="#" class="nav-link ${state.activeCategory === 'trousers' ? 'active' : ''}" data-category="trousers">Trousers</a>
          <a href="#" class="nav-link ${state.activeCategory === 'pants' ? 'active' : ''}" data-category="pants">Pants</a>
        </nav>

        <!-- Right Action Tray -->
        <div class="header-actions">
          <!-- Search Icon Button -->
          <button class="action-btn" id="btn-open-search" title="Search Catalog">
            🔍
            ${state.searchQuery ? `<span class="badge-count" style="background: var(--accent-gold); color: #000;">✓</span>` : ''}
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

    <!-- Live Search Overlay Modal -->
    <div id="search-overlay-modal" class="modal-backdrop" style="display: none; align-items: flex-start; padding-top: 5vh; z-index: 9999;">
      <div class="modal-content" style="max-width: 780px; width: 92%; background: var(--bg-card); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md); box-shadow: 0 20px 60px rgba(0,0,0,0.8); overflow: hidden;">
        
        <!-- Search Header Bar -->
        <div style="padding: 1.2rem 1.6rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.8rem; width: 100%;">
            <span style="font-size: 1.3rem;">🔍</span>
            <input type="text" id="live-search-input" placeholder="Search sneakers, cargo pants, t-shirts, sizes (e.g. Jordan, Baggy, 42)..." value="${state.searchQuery || ''}" style="width: 100%; background: transparent; border: none; outline: none; color: #ffffff; font-size: 1.1rem; font-family: inherit;" />
          </div>
          <button id="btn-close-search" style="background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; padding: 0 0.5rem;">✕</button>
        </div>

        <!-- Quick Trending Tags -->
        <div style="padding: 0.8rem 1.6rem; background: rgba(212,175,55,0.05); border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
          <span style="font-size: 0.78rem; color: var(--accent-gold); font-weight: 700;">POPULAR SEARCHES:</span>
          <button class="search-tag-chip" data-query="Jordan">Jordan 1</button>
          <button class="search-tag-chip" data-query="Baggy">Baggy Denim</button>
          <button class="search-tag-chip" data-query="Tee">Streetwear Tee</button>
          <button class="search-tag-chip" data-query="Cargo">Cargo Trousers</button>
          <button class="search-tag-chip" data-query="42">Size 42</button>
        </div>

        <!-- Live Matching Results Box -->
        <div id="live-search-results" style="max-height: 480px; overflow-y: auto; padding: 1.2rem 1.6rem;">
          <!-- Results injected dynamically -->
        </div>

        <!-- Search Footer Bar -->
        <div style="padding: 0.9rem 1.6rem; background: var(--bg-secondary); border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">Press <kbd style="background: var(--bg-primary); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-light); color: #fff;">ESC</kbd> to exit</span>
          <button class="btn btn-secondary" id="btn-clear-search-filter" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
            Clear Search Filter
          </button>
        </div>

      </div>
    </div>
  `;

  // Attach Event Listeners
  const logoBtn = container.querySelector('#logo-home');
  logoBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    appStore.setCategory('all');
    appStore.setSearchQuery('');
  });

  const navLinks = container.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.dataset.category;
      appStore.setCategory(cat);
    });
  });

  const cartBtn = container.querySelector('#btn-open-cart');
  cartBtn?.addEventListener('click', () => appStore.toggleCart(true));

  const wishlistBtn = container.querySelector('#btn-open-wishlist');
  wishlistBtn?.addEventListener('click', () => appStore.toggleWishlistModal(true));

  // Search Modal Elements
  const searchModal = container.querySelector('#search-overlay-modal');
  const searchInput = container.querySelector('#live-search-input');
  const resultsContainer = container.querySelector('#live-search-results');

  function openSearchModal() {
    searchModal.style.display = 'flex';
    setTimeout(() => searchInput.focus(), 50);
    renderLiveSearchResults(searchInput.value.trim());
  }

  function closeSearchModal() {
    searchModal.style.display = 'none';
  }

  container.querySelector('#btn-open-search')?.addEventListener('click', openSearchModal);
  container.querySelector('#btn-close-search')?.addEventListener('click', closeSearchModal);

  searchModal?.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearchModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.style.display === 'flex') {
      closeSearchModal();
    }
  });

  // Live Input Matching
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    appStore.setSearchQuery(q);
    renderLiveSearchResults(q);
  });

  // Trending Tag Chips
  container.querySelectorAll('.search-tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.query;
      searchInput.value = q;
      appStore.setSearchQuery(q);
      renderLiveSearchResults(q);
    });
  });

  container.querySelector('#btn-clear-search-filter')?.addEventListener('click', () => {
    searchInput.value = '';
    appStore.setSearchQuery('');
    renderLiveSearchResults('');
  });

  // Render Matching Products Preview
  function renderLiveSearchResults(query) {
    const products = state.products || [];
    let matches = products;

    if (query) {
      const q = query.toLowerCase();
      matches = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sizes && p.sizes.some(s => s.toLowerCase().includes(q))) ||
        (p.color && p.color.toLowerCase().includes(q))
      );
    }

    if (matches.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h4 style="color: #fff; font-size: 1.1rem;">No matching items found for "${query}"</h4>
          <p style="font-size: 0.85rem; margin-top: 0.4rem;">Try searching for "Jordan", "Baggy", "Trousers", or size "42"</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = `
      <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <span>Found <strong style="color: var(--accent-gold);">${matches.length}</strong> matching products${query ? ` for "${query}"` : ''}:</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
        ${matches.map(p => `
          <div class="search-item-card" data-id="${p.id}" style="background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 0.8rem; display: flex; flex-direction: column; gap: 0.6rem; cursor: pointer; transition: all 0.2s ease;">
            <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 4px;" />
            <div>
              <span class="badge badge-gold" style="font-size: 0.68rem; margin-bottom: 0.3rem;">${p.category.toUpperCase()}</span>
              <h5 style="font-size: 0.88rem; color: #fff; line-height: 1.25; margin-bottom: 0.4rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.name}</h5>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                <span style="color: var(--accent-gold); font-weight: 800; font-size: 0.95rem;">PKR ${p.price.toLocaleString()}</span>
                <span style="font-size: 0.72rem; color: var(--text-muted);">${p.sizes ? p.sizes.slice(0, 3).join(', ') : ''}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Click item preview to open product modal
    resultsContainer.querySelectorAll('.search-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const prodId = card.dataset.id;
        const targetProd = state.products.find(p => p.id === prodId);
        if (targetProd) {
          closeSearchModal();
          appStore.openProductModal(targetProd);
        }
      });
    });
  }
}
