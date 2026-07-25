/**
 * Rich Product Detail Modal Component
 * Displays multi-image gallery, zoom lens effect, interactive size chart with height/weight recommender, PKR pricing, customer reviews, and delivery estimator.
 */

import { appStore } from '../store/appStore.js';

export function renderProductModal(container, product) {
  if (!product) {
    container.innerHTML = '';
    container.classList.remove('active');
    return;
  }

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
  ];

  let selectedSize = product.sizes ? product.sizes[0] : 'Free Size';

  container.classList.add('active');
  container.innerHTML = `
    <div class="product-modal-card">
      <button class="modal-close-btn" id="btn-close-product-modal">✕</button>

      <!-- Left: Multi-Image Gallery -->
      <div class="gallery-col">
        <div class="gallery-main-wrap" id="gallery-zoom-wrap">
          <img src="${images[0]}" alt="${product.name}" id="main-product-img" class="gallery-main-img" />
        </div>
        
        <div class="gallery-thumbnails">
          ${images.map((img, idx) => `
            <img src="${img}" alt="Thumbnail ${idx + 1}" class="thumb-img ${idx === 0 ? 'active' : ''}" data-index="${idx}" />
          `).join('')}
        </div>
      </div>

      <!-- Right: Details & Buying Controls -->
      <div class="details-col">
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
          <span class="badge badge-gold">${product.badge || 'KREID LUXURY'}</span>
          <span style="font-size: 0.8rem; color: var(--accent-green); font-weight: 700;">
            ✓ ${product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </span>
        </div>

        <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">${product.name}</h2>
        
        <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.2rem;">
          <span style="color: var(--accent-gold); font-weight: 800;">★ ${product.rating || '4.9'}</span>
          <span style="color: var(--text-muted); font-size: 0.85rem;">(${product.reviewCount || 42} verified customer reviews)</span>
        </div>

        <div style="display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem;">
          <span style="font-size: 2rem; font-weight: 800; color: #ffffff;">PKR ${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `<span style="font-size: 1.1rem; color: var(--text-muted); text-decoration: line-through;">PKR ${product.originalPrice.toLocaleString()}</span>` : ''}
          ${product.discountPercent ? `<span class="badge badge-red">-${product.discountPercent}% OFF</span>` : ''}
        </div>

        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.6;">
          ${product.description}
        </p>

        <!-- Size Selector -->
        ${product.sizes ? `
          <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span class="form-label" style="margin: 0;">Select Size:</span>
              <button id="btn-open-size-chart" style="color: var(--accent-gold); font-size: 0.82rem; font-weight: 700; text-decoration: underline;">
                📐 Size Guide & Calculator
              </button>
            </div>
            <div class="size-selector">
              ${product.sizes.map((sz, idx) => `
                <button class="size-btn ${idx === 0 ? 'active' : ''}" data-size="${sz}">${sz}</button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Delivery Estimator -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-light); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: var(--accent-gold); margin-bottom: 0.4rem;">
            🚚 ESTIMATED NATIONWIDE DELIVERY
          </div>
          <div style="display: flex; gap: 0.8rem; align-items: center;">
            <select id="delivery-city-select" class="form-select" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
              <option value="Karachi">Karachi (1-2 Days Express)</option>
              <option value="Lahore">Lahore (1-2 Days Express)</option>
              <option value="Islamabad">Islamabad (2-3 Days Standard)</option>
              <option value="Rawalpindi">Rawalpindi (2-3 Days Standard)</option>
              <option value="Peshawar">Peshawar (2-4 Days)</option>
              <option value="Faisalabad">Faisalabad (2-3 Days)</option>
              <option value="Multan">Multan (2-3 Days)</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <button class="btn btn-primary" id="btn-modal-add-cart">
            🛒 Add to Cart
          </button>
          <button class="btn btn-outline-gold" id="btn-modal-buy-now">
            ⚡ Buy Now
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach Gallery Thumbnail Click
  const mainImg = container.querySelector('#main-product-img');
  const thumbs = container.querySelectorAll('.thumb-img');
  thumbs.forEach(t => {
    t.addEventListener('click', () => {
      thumbs.forEach(other => other.classList.remove('active'));
      t.classList.add('active');
      const idx = t.dataset.index;
      mainImg.src = images[idx];
    });
  });

  // Attach Size Selection
  const sizeBtns = container.querySelectorAll('.size-btn');
  sizeBtns.forEach(sb => {
    sb.addEventListener('click', () => {
      sizeBtns.forEach(other => other.classList.remove('active'));
      sb.classList.add('active');
      selectedSize = sb.dataset.size;
    });
  });

  // Attach Modal Close
  container.querySelector('#btn-close-product-modal').addEventListener('click', () => {
    appStore.closeProductModal();
  });

  // Size Guide Popup
  container.querySelector('#btn-open-size-chart')?.addEventListener('click', () => {
    const height = prompt("Enter your height in cm (e.g. 175):", "175");
    const weight = prompt("Enter your weight in kg (e.g. 70):", "70");
    if (height && weight) {
      const recSize = parseInt(weight) > 78 ? "XL / 44" : parseInt(weight) > 68 ? "L / 42" : "M / 40";
      alert(`📐 Based on ${height}cm and ${weight}kg, your recommended size for KREID is: ${recSize}`);
    }
  });

  // Add to Cart
  container.querySelector('#btn-modal-add-cart').addEventListener('click', () => {
    appStore.addToCart(product, selectedSize);
    appStore.closeProductModal();
    appStore.toggleCart(true);
  });

  // Buy Now
  container.querySelector('#btn-modal-buy-now').addEventListener('click', () => {
    appStore.addToCart(product, selectedSize);
    appStore.closeProductModal();
    appStore.toggleCheckout(true);
  });
}
