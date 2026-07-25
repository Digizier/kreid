/**
 * Shopping Cart Slide-Over Drawer Component
 * Displays item count, quantity modifiers, coupon code applicator, PKR math summary, and checkout trigger.
 */

import { appStore } from '../store/appStore.js';

export function renderCartDrawer(container, state) {
  const isOpen = state.isCartOpen;
  const subtotal = appStore.getCartSubtotal();
  const discount = appStore.getCartDiscount();
  const shipping = appStore.getCartShippingFee();
  const total = appStore.getCartTotal();

  if (isOpen) {
    container.classList.add('open');
  } else {
    container.classList.remove('open');
  }

  container.innerHTML = `
    <div class="cart-header">
      <h3 style="font-size: 1.3rem;">Shopping Bag (${state.cart.length})</h3>
      <button id="btn-close-cart" style="font-size: 1.4rem; color: var(--text-muted);">✕</button>
    </div>

    <!-- Free Shipping Progress -->
    <div style="padding: 0.8rem 1.5rem; background: rgba(212, 175, 55, 0.1); border-bottom: 1px solid var(--border-light); font-size: 0.82rem;">
      ${subtotal >= 5000 
        ? `<span style="color: var(--accent-gold); font-weight: 700;">🎉 Congratulations! You unlocked Free Shipping across Pakistan!</span>`
        : `Add <strong>PKR ${(5000 - subtotal).toLocaleString()}</strong> more to unlock FREE Delivery!`
      }
    </div>

    <!-- Cart Items List -->
    <div class="cart-items-wrap">
      ${state.cart.length === 0 ? `
        <div style="text-align: center; margin: auto; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 0.8rem;">🛒</div>
          <p style="font-weight: 600;">Your bag is currently empty.</p>
          <button class="btn btn-primary" id="btn-cart-start-shopping" style="margin-top: 1rem;">
            Start Shopping
          </button>
        </div>
      ` : state.cart.map((item, idx) => `
        <div class="cart-item">
          <img src="${item.images ? item.images[0] : ''}" alt="${item.name}" class="cart-item-img" />
          <div style="flex-grow: 1;">
            <h4 style="font-size: 0.95rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.2rem;">${item.name}</h4>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
              Size: <strong style="color: var(--accent-gold);">${item.selectedSize}</strong> | ${item.selectedColor || ''}
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 0.2rem 0.6rem;">
                <button class="btn-qty-minus" data-index="${idx}" style="font-weight: 800;">-</button>
                <span style="font-weight: 700; font-size: 0.9rem;">${item.quantity}</span>
                <button class="btn-qty-plus" data-index="${idx}" style="font-weight: 800;">+</button>
              </div>

              <span style="font-weight: 800; color: #ffffff;">PKR ${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          </div>
          <button class="btn-remove-item" data-index="${idx}" style="color: var(--accent-neon); font-size: 0.9rem; align-self: flex-start;">✕</button>
        </div>
      `).join('')}
    </div>

    <!-- Cart Footer with Coupons & Summary -->
    ${state.cart.length > 0 ? `
      <div class="cart-footer">
        <!-- Coupon Code Form -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.2rem;">
          <input type="text" id="coupon-code-input" placeholder="Promo Code (e.g. KREID10)" class="form-input" style="padding: 0.5rem 0.8rem; font-size: 0.85rem;" value="${state.activeCoupon ? state.activeCoupon.code : ''}" />
          ${state.activeCoupon ? `
            <button class="btn btn-secondary" id="btn-remove-coupon" style="padding: 0.5rem 0.8rem; font-size: 0.8rem;">Remove</button>
          ` : `
            <button class="btn btn-outline-gold" id="btn-apply-coupon" style="padding: 0.5rem 0.8rem; font-size: 0.8rem;">Apply</button>
          `}
        </div>

        <!-- Summary Math -->
        <div style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.9rem; margin-bottom: 1.2rem;">
          <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
            <span>Subtotal:</span>
            <span>PKR ${subtotal.toLocaleString()}</span>
          </div>
          
          ${discount > 0 ? `
            <div style="display: flex; justify-content: space-between; color: var(--accent-gold); font-weight: 700;">
              <span>Coupon Discount (${state.activeCoupon.code}):</span>
              <span>- PKR ${discount.toLocaleString()}</span>
            </div>
          ` : ''}

          <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
            <span>Estimated Shipping:</span>
            <span>${shipping === 0 ? '<strong style="color: var(--accent-green);">FREE</strong>' : `PKR ${shipping}`}</span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; color: #ffffff; border-top: 1px solid var(--border-light); padding-top: 0.6rem; margin-top: 0.4rem;">
            <span>Grand Total:</span>
            <span style="color: var(--accent-gold);">PKR ${total.toLocaleString()}</span>
          </div>
        </div>

        <button class="btn btn-primary" id="btn-cart-checkout" style="width: 100%;">
          ⚡ Proceed to Checkout
        </button>
      </div>
    ` : ''}
  `;

  // Attach Event Listeners
  container.querySelector('#btn-close-cart')?.addEventListener('click', () => {
    appStore.toggleCart(false);
  });

  container.querySelector('#btn-cart-start-shopping')?.addEventListener('click', () => {
    appStore.toggleCart(false);
    appStore.setCategory('all');
  });

  const qtyMinusBtns = container.querySelectorAll('.btn-qty-minus');
  qtyMinusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      appStore.updateCartQuantity(idx, -1);
    });
  });

  const qtyPlusBtns = container.querySelectorAll('.btn-qty-plus');
  qtyPlusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      appStore.updateCartQuantity(idx, 1);
    });
  });

  const removeBtns = container.querySelectorAll('.btn-remove-item');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      appStore.removeFromCart(idx);
    });
  });

  container.querySelector('#btn-apply-coupon')?.addEventListener('click', () => {
    const input = container.querySelector('#coupon-code-input');
    if (input && input.value) {
      appStore.applyCoupon(input.value);
    }
  });

  container.querySelector('#btn-remove-coupon')?.addEventListener('click', () => {
    appStore.removeCoupon();
  });

  container.querySelector('#btn-cart-checkout')?.addEventListener('click', () => {
    appStore.toggleCart(false);
    appStore.toggleCheckout(true);
  });
}
