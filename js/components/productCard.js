/**
 * Product Card Component
 * Interactive mobile-optimized product card with high-res image preview, wishlist toggle, quick add, and detail modal trigger.
 */

import { appStore } from '../store/appStore.js';

export function createProductCard(product) {
  const isWishlisted = appStore.isInWishlist(product.id);
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.id = product.id;

  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80';

  card.innerHTML = `
    <div class="card-img-wrap">
      ${product.badge ? `<span class="badge badge-gold card-badge">${product.badge}</span>` : ''}
      <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" title="Save to Wishlist">
        ❤️
      </button>
      <img src="${mainImage}" alt="${product.name}" class="card-img" loading="lazy" />
    </div>

    <div class="card-body">
      <div class="card-category">${product.category}</div>
      <h3 class="card-title">${product.name}</h3>
      
      <div class="card-price-row">
        <span class="current-price">PKR ${product.price.toLocaleString()}</span>
        ${product.originalPrice ? `<span class="original-price">PKR ${product.originalPrice.toLocaleString()}</span>` : ''}
      </div>

      <!-- Mobile-Optimized Action Tray -->
      <div class="card-actions">
        <button class="btn btn-secondary btn-quick-view" title="Quick View Details">
          👁️ <span class="btn-text-desktop">Details</span>
        </button>
        <button class="btn btn-primary btn-add-cart" title="Add to Cart">
          🛒 <span class="btn-text-full">+ Add to Cart</span>
        </button>
      </div>
    </div>
  `;

  // Attach Event Listeners
  const wishlistBtn = card.querySelector('.wishlist-btn');
  wishlistBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    appStore.toggleWishlist(product);
  });

  const quickViewBtn = card.querySelector('.btn-quick-view');
  quickViewBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    appStore.openProductModal(product);
  });

  const addCartBtn = card.querySelector('.btn-add-cart');
  addCartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    appStore.addToCart(product);
  });

  card.addEventListener('click', () => {
    appStore.openProductModal(product);
  });

  return card;
}
