/**
 * Hero Banner Component for KREID Storefront
 */

import { appStore } from '../store/appStore.js';

export function renderHero(container) {
  container.innerHTML = `
    <section class="hero-section">
      <div class="hero-bg-overlay"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-tag">
            <span>✨</span> NEW PAKISTANI LUXURY STREETWEAR
          </div>
          <h1 class="hero-title">
            DEFINING LUXURY & STREET CULTURE.
          </h1>
          <p class="hero-subtitle">
            Discover premium footwear, vintage wide-leg baggy denim, and heavyweight streetwear crafted for distinction. Nationwide COD & Express 24-48hr Courier Delivery across Pakistan.
          </p>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn-primary" id="hero-btn-shoes">
              Shop Shoes Collection
            </button>
            <button class="btn btn-secondary" id="hero-btn-trousers">
              Explore Baggy Trousers
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  container.querySelector('#hero-btn-shoes')?.addEventListener('click', () => {
    appStore.setCategory('shoes');
  });

  container.querySelector('#hero-btn-trousers')?.addEventListener('click', () => {
    appStore.setCategory('trousers');
  });
}
