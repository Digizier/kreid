/**
 * Header Component for KREID Storefront
 * Smooth Live Search Drawer with Real Product Image Thumbnails & Uninterrupted Typing Focus
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
          <!-- Inline Search Bar -->
          <div id="inline-search-bar-wrap" style="position: relative; display: flex; align-items: center; background: var(--bg-secondary); border: 1.5px solid var(--border-gold); border-radius: var(--radius-full); padding: 0.35rem 0.9rem; width: 220px; cursor: pointer;">
            <span style="font-size: 0.9rem; margin-right: 0.5rem; opacity: 0.7;">🔍</span>
            <input type="text" id="header-search-input" placeholder="Search catalog..." value="${state.searchQuery || ''}" style="width: 100%; background: transparent; border: none; outline: none; color: #ffffff; font-size: 0.85rem; font-family: inherit; cursor: pointer;" readonly />
            ${state.searchQuery ? `<button id="btn-clear-header-search" style="background: transparent; border: none; color: var(--text-muted); font-size: 0.85rem; cursor: pointer; padding: 0;">✕</button>` : ''}
          </div>

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

    <!-- Full-Width Top Search Overlay Drawer -->
    <div id="search-overlay-modal" class="modal-backdrop" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 10000; justify-content: center; align-items: flex-start; padding: 2rem 1rem;">
      <div style="background: var(--bg-card); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md); width: 100%; max-width: 1100px; max-height: 88vh; display: flex; flex-direction: column; box-shadow: 0 30px 80px rgba(0,0,0,0.9); overflow: hidden;">
        
        <!-- Large Search Input Header Bar -->
        <div style="padding: 1.4rem 2rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-gold); display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; width: 100%;">
            <span style="font-size: 1.6rem; color: var(--accent-gold);">🔍</span>
            <input type="text" id="live-search-input" placeholder="Type to search sneakers, baggy denim, t-shirts, sizes (e.g. Jordan, Baggy, 42)..." value="${state.searchQuery || ''}" style="width: 100%; background: transparent; border: none; outline: none; color: #ffffff; font-size: 1.25rem; font-family: inherit; font-weight: 600;" />
          </div>
          <button id="btn-close-search" style="background: var(--bg-primary); border: 1px solid var(--border-light); color: #ffffff; width: 40px; height: 40px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">✕</button>
        </div>

        <!-- Quick Trending Search Tags -->
        <div style="padding: 0.9rem 2rem; background: rgba(212,175,55,0.06); border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
          <span style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 800; letter-spacing: 0.05em;">POPULAR SEARCHES:</span>
          <button class="search-tag-chip" data-query="Jordan">Jordan 1</button>
          <button class="search-tag-chip" data-query="Baggy">Baggy Denim</button>
          <button class="search-tag-chip" data-query="Tee">Streetwear Tee</button>
          <button class="search-tag-chip" data-query="Cargo">Cargo Trousers</button>
          <button class="search-tag-chip" data-query="42">Size 42</button>
        </div>

        <!-- Centered Live Matching Product Grid -->
        <div id="live-search-results" style="padding: 1.8rem 2rem; overflow-y: auto; flex: 1;">
          <!-- Results injected dynamically with real images -->
        </div>

        <!-- Footer Action Bar -->
        <div style="padding: 1rem 2rem; background: var(--bg-secondary); border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.82rem; color: var(--text-muted);">Press <kbd style="background: var(--bg-primary); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-light); color: #fff;">ESC</kbd> to close</span>
          <div style="display: flex; gap: 0.8rem;">
            <button class="btn btn-secondary" id="btn-clear-search-filter" style="font-size: 0.82rem; padding: 0.45rem 0.9rem;">
              Clear Search Input
            </button>
            <button class="btn btn-primary" id="btn-apply-catalog-search" style="font-size: 0.82rem; padding: 0.45rem 1rem;">
              Filter Catalog Grid
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  // Attach Navigation Listeners
  container.querySelector('#logo-home')?.addEventListener('click', (e) => {
    e.preventDefault();
    appStore.setCategory('all');
    appStore.setSearchQuery('');
  });

  container.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      appStore.setCategory(link.dataset.category);
      appStore.setSearchQuery('');
    });
  });

  container.querySelector('#btn-open-cart')?.addEventListener('click', () => appStore.toggleCart(true));
  container.querySelector('#btn-open-wishlist')?.addEventListener('click', () => appStore.toggleWishlistModal(true));

  // Search Modal DOM Elements
  const searchModal = container.querySelector('#search-overlay-modal');
  const liveSearchInput = container.querySelector('#live-search-input');
  const headerSearchInput = container.querySelector('#header-search-input');
  const resultsContainer = container.querySelector('#live-search-results');

  function openSearchModal(initialQuery = '') {
    searchModal.style.display = 'flex';
    if (initialQuery) {
      liveSearchInput.value = initialQuery;
    }
    setTimeout(() => liveSearchInput.focus(), 50);
    renderLiveSearchResults(liveSearchInput.value.trim());
  }

  function closeSearchModal() {
    searchModal.style.display = 'none';
  }

  container.querySelector('#inline-search-bar-wrap')?.addEventListener('click', () => {
    openSearchModal(headerSearchInput.value);
  });

  container.querySelector('#btn-clear-header-search')?.addEventListener('click', (e) => {
    e.stopPropagation();
    headerSearchInput.value = '';
    appStore.setSearchQuery('');
  });

  container.querySelector('#btn-close-search')?.addEventListener('click', closeSearchModal);

  searchModal?.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearchModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.style.display === 'flex') {
      closeSearchModal();
    }
  });

  // Local Live Typing without destroying DOM!
  liveSearchInput?.addEventListener('input', (e) => {
    const q = e.target.value;
    renderLiveSearchResults(q.trim());
  });

  liveSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = liveSearchInput.value.trim();
      appStore.setSearchQuery(q);
      closeSearchModal();
    }
  });

  container.querySelector('#btn-apply-catalog-search')?.addEventListener('click', () => {
    const q = liveSearchInput.value.trim();
    appStore.setSearchQuery(q);
    closeSearchModal();
  });

  // Trending Tag Chips
  container.querySelectorAll('.search-tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.query;
      liveSearchInput.value = q;
      renderLiveSearchResults(q);
    });
  });

  container.querySelector('#btn-clear-search-filter')?.addEventListener('click', () => {
    liveSearchInput.value = '';
    renderLiveSearchResults('');
  });

  // Render Matching Products Preview with Real High-Res Images
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
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 0.6rem;">🔍</div>
          <h4 style="color: #fff; font-size: 1.2rem;">No matching items found for "${query}"</h4>
          <p style="font-size: 0.9rem; margin-top: 0.4rem;">Try searching for "Jordan", "Baggy", "Trousers", or size "42"</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = `
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.2rem; display: flex; justify-content: space-between; align-items: center;">
        <span>Found <strong style="color: var(--accent-gold); font-size: 1.05rem;">${matches.length}</strong> matching products${query ? ` for "${query}"` : ''}:</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1.4rem;">
        ${matches.map(p => {
          const imgUrl = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80');
          return `
            <div class="search-item-card" data-id="${p.id}" style="background: var(--bg-secondary); border: 1.5px solid var(--border-light); border-radius: var(--radius-sm); padding: 1rem; display: flex; flex-direction: column; gap: 0.7rem; cursor: pointer; transition: all 0.25s ease; position: relative;">
              <div style="overflow: hidden; border-radius: 6px; background: #000;">
                <img src="${imgUrl}" alt="${p.name}" style="width: 100%; height: 180px; object-fit: cover; transition: transform 0.3s ease; display: block;" />
              </div>
              <div style="display: flex; flex-direction: column; flex: 1;">
                <span class="badge badge-gold" style="font-size: 0.7rem; margin-bottom: 0.4rem; align-self: flex-start;">${p.category.toUpperCase()}</span>
                <h5 style="font-size: 0.92rem; color: #ffffff; line-height: 1.3; margin-bottom: 0.4rem; font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.name}</h5>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.4rem;">
                  <span style="color: var(--accent-gold); font-weight: 800; font-size: 1.05rem;">PKR ${p.price.toLocaleString()}</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${p.sizes ? p.sizes.slice(0, 3).join(', ') : ''}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
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
