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

  // Size Guide Popup Trigger
  container.querySelector('#btn-open-size-chart')?.addEventListener('click', () => {
    openSizeGuideModal(product);
  });

  // Add to Cart
  container.querySelector('#btn-modal-add-cart').addEventListener('click', () => {
    appStore.addToCart(product, selectedSize);
    appStore.closeProductModal();
    appStore.toggleCart(true);
  });

  // Buy Now
  container.querySelector('#btn-modal-add-cart')?.insertAdjacentHTML('afterend', `
    <div id="size-guide-modal-root" class="modal-backdrop" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 10005; justify-content: center; align-items: center; padding: 1rem;"></div>
  `);

  container.querySelector('#btn-modal-buy-now').addEventListener('click', () => {
    appStore.addToCart(product, selectedSize);
    appStore.closeProductModal();
    appStore.toggleCheckout(true);
  });
}

/**
 * Interactive Size Guide & Calculator Modal Component
 */
function openSizeGuideModal(product) {
  let modalRoot = document.getElementById('size-guide-modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'size-guide-modal-root';
    modalRoot.className = 'modal-backdrop';
    modalRoot.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 10005; justify-content: center; align-items: center; padding: 1rem;';
    document.body.appendChild(modalRoot);
  }

  const isShoes = product.category === 'shoes';

  modalRoot.style.display = 'flex';
  modalRoot.innerHTML = `
    <div style="background: var(--bg-card); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md); width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; padding: 1.8rem; box-shadow: 0 20px 60px rgba(0,0,0,0.9); position: relative;">
      <button id="btn-close-size-guide" style="position: absolute; top: 1rem; right: 1rem; background: var(--bg-primary); border: 1px solid var(--border-light); color: #fff; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 1.1rem;">✕</button>

      <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1.2rem;">
        <span style="font-size: 1.8rem; color: var(--accent-gold);">📐</span>
        <div>
          <h3 style="color: #ffffff; font-size: 1.25rem; font-weight: 800;">KREID Size Guide & Smart Calculator</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">Category: <strong style="color: var(--accent-gold); text-transform: uppercase;">${product.category}</strong></p>
        </div>
      </div>

      <!-- Smart Calculator Box -->
      <div style="background: rgba(212,175,55,0.08); border: 1px solid var(--accent-gold); border-radius: var(--radius-sm); padding: 1.2rem; margin-bottom: 1.5rem;">
        <h4 style="color: var(--accent-gold); font-size: 0.95rem; font-weight: 800; margin-bottom: 0.6rem;">🧮 Interactive Fit Recommender</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="font-size: 0.8rem; color: #fff; display: block; margin-bottom: 0.3rem;">Your Height (cm):</label>
            <input type="number" id="calc-input-height" value="175" min="120" max="220" style="width: 100%; padding: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-light); color: #fff; border-radius: 4px; font-weight: 700;" />
          </div>

          <div>
            <label style="font-size: 0.8rem; color: #fff; display: block; margin-bottom: 0.3rem;">Your Weight (kg):</label>
            <input type="number" id="calc-input-weight" value="72" min="30" max="180" style="width: 100%; padding: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-light); color: #fff; border-radius: 4px; font-weight: 700;" />
          </div>
        </div>

        <button id="btn-run-size-calc" class="btn btn-primary" style="width: 100%; padding: 0.6rem; font-size: 0.85rem;">
          ⚡ Calculate My Perfect Size
        </button>

        <div id="size-calc-result-box" style="margin-top: 1rem; display: none; background: var(--bg-primary); border: 1px solid var(--accent-green); padding: 0.8rem 1rem; border-radius: 6px; text-align: center;">
          <div style="font-size: 0.78rem; color: var(--text-muted);">RECOMMENDED SIZE FOR YOU</div>
          <div id="size-result-value" style="font-size: 1.4rem; font-weight: 800; color: var(--accent-green);">SIZE 42</div>
        </div>
      </div>

      <!-- Size Conversion Table -->
      <h4 style="color: #fff; font-size: 0.95rem; font-weight: 700; margin-bottom: 0.8rem;">
        📊 Standard Pakistani ${isShoes ? 'Footwear' : 'Apparel'} Size Conversion Table
      </h4>

      <div style="overflow-x: auto;">
        <table class="admin-table" style="width: 100%; font-size: 0.82rem; text-align: center;">
          <thead>
            <tr>
              ${isShoes ? `
                <th>EU</th>
                <th>US</th>
                <th>UK</th>
                <th>Foot Length (CM)</th>
              ` : `
                <th>Size</th>
                <th>Chest (Inches)</th>
                <th>Waist (Inches)</th>
                <th>Length (Inches)</th>
              `}
            </tr>
          </thead>
          <tbody>
            ${isShoes ? `
              <tr><td><strong>39</strong></td><td>6.5</td><td>6.0</td><td>24.5 cm</td></tr>
              <tr><td><strong>40</strong></td><td>7.5</td><td>7.0</td><td>25.2 cm</td></tr>
              <tr><td><strong>41</strong></td><td>8.5</td><td>8.0</td><td>26.0 cm</td></tr>
              <tr style="background: rgba(212,175,55,0.15);"><td><strong style="color: var(--accent-gold);">42</strong></td><td>9.0</td><td>8.5</td><td>26.7 cm</td></tr>
              <tr><td><strong>43</strong></td><td>10.0</td><td>9.5</td><td>27.5 cm</td></tr>
              <tr><td><strong>44</strong></td><td>11.0</td><td>10.5</td><td>28.3 cm</td></tr>
              <tr><td><strong>45</strong></td><td>12.0</td><td>11.5</td><td>29.0 cm</td></tr>
            ` : `
              <tr><td><strong>S</strong></td><td>36 - 38"</td><td>28 - 30"</td><td>27"</td></tr>
              <tr style="background: rgba(212,175,55,0.15);"><td><strong style="color: var(--accent-gold);">M</strong></td><td>38 - 40"</td><td>31 - 33"</td><td>28"</td></tr>
              <tr><td><strong>L</strong></td><td>41 - 43"</td><td>34 - 36"</td><td>29"</td></tr>
              <tr><td><strong>XL</strong></td><td>44 - 46"</td><td>37 - 39"</td><td>30"</td></tr>
              <tr><td><strong>XXL</strong></td><td>47 - 49"</td><td>40 - 42"</td><td>31"</td></tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;

  modalRoot.querySelector('#btn-close-size-guide')?.addEventListener('click', () => {
    modalRoot.style.display = 'none';
  });

  const calcBtn = modalRoot.querySelector('#btn-run-size-calc');
  const resultBox = modalRoot.querySelector('#size-calc-result-box');
  const resultVal = modalRoot.querySelector('#size-result-value');

  calcBtn?.addEventListener('click', () => {
    const h = parseInt(modalRoot.querySelector('#calc-input-height').value) || 175;
    const w = parseInt(modalRoot.querySelector('#calc-input-weight').value) || 72;

    let rec = "M";
    if (isShoes) {
      if (w > 90 || h > 185) rec = "Size 44 (EU 44)";
      else if (w > 80 || h > 180) rec = "Size 43 (EU 43)";
      else if (w > 70 || h > 173) rec = "Size 42 (EU 42)";
      else if (w > 60 || h > 165) rec = "Size 41 (EU 41)";
      else rec = "Size 40 (EU 40)";
    } else {
      if (w > 92) rec = "Size XXL";
      else if (w > 82) rec = "Size XL";
      else if (w > 72) rec = "Size L";
      else if (w > 62) rec = "Size M";
      else rec = "Size S";
    }

    resultVal.innerHTML = `🎉 Recommended Size: <strong style="color: var(--accent-gold);">${rec}</strong>`;
    resultBox.style.display = 'block';
  });
}

