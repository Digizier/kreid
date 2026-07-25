/**
 * Favorites / Wishlist Modal Component
 * Displays user's saved favorite items with quick add-to-cart or remove buttons.
 */

import { appStore } from '../store/appStore.js';

export function renderWishlistModal(container, state) {
  const isOpen = state.isWishlistOpen;
  const wishlist = state.wishlist;

  if (!isOpen) {
    container.classList.remove('active');
    container.innerHTML = '';
    return;
  }

  container.classList.add('active');

  container.innerHTML = `
    <div class="checkout-modal-card" style="max-width: 650px;">
      <button class="modal-close-btn" id="btn-close-wishlist">✕</button>

      <h2 style="font-size: 1.6rem; margin-bottom: 0.3rem;">❤️ Your Saved Favorites (${wishlist.length})</h2>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
        Items saved to your personal wishlist session.
      </p>

      ${wishlist.length === 0 ? `
        <div style="text-align: center; padding: 3rem 0; color: var(--text-muted);">
          <div style="font-size: 3.5rem; margin-bottom: 0.8rem;">💔</div>
          <h3 style="font-size: 1.2rem; margin-bottom: 0.4rem;">No Favorites Saved Yet</h3>
          <p style="font-size: 0.88rem;">Click the heart icon on any shoe or garment to save it here!</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 60vh; overflow-y: auto; padding-right: 0.5rem;">
          ${wishlist.map((item) => `
            <div style="display: flex; gap: 1rem; background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 1rem; border-radius: var(--radius-md); align-items: center;">
              <img src="${item.images ? item.images[0] : ''}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm);" />
              
              <div style="flex-grow: 1;">
                <div style="font-size: 0.75rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 700;">${item.category}</div>
                <h4 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin-bottom: 0.3rem;">${item.name}</h4>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--accent-gold);">PKR ${item.price.toLocaleString()}</div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="btn btn-primary btn-wishlist-add" data-id="${item.id}" style="padding: 0.45rem 0.9rem; font-size: 0.78rem;">
                  + Add to Cart
                </button>
                <button class="btn btn-secondary btn-wishlist-remove" data-id="${item.id}" style="padding: 0.45rem 0.9rem; font-size: 0.78rem; color: var(--accent-neon);">
                  Remove
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  // Attach Event Listeners
  container.querySelector('#btn-close-wishlist')?.addEventListener('click', () => {
    appStore.toggleWishlistModal(false);
  });

  const addBtns = container.querySelectorAll('.btn-wishlist-add');
  addBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.dataset.id;
      const product = wishlist.find(p => p.id === prodId);
      if (product) {
        appStore.addToCart(product);
        appStore.toggleWishlistModal(false);
        appStore.toggleCart(true);
      }
    });
  });

  const removeBtns = container.querySelectorAll('.btn-wishlist-remove');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.dataset.id;
      const product = wishlist.find(p => p.id === prodId);
      if (product) {
        appStore.toggleWishlist(product);
      }
    });
  });
}
