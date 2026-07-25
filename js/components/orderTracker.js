/**
 * Live Order Consignment Tracking Component
 * Allows customers to input their tracking ID (e.g. TRX-8827419) and view step-by-step dispatch status.
 */

import { appStore } from '../store/appStore.js';

export function renderOrderTracker(container, state) {
  const isOpen = state.isOrderTrackerOpen;
  
  if (!isOpen) {
    container.classList.remove('active');
    container.innerHTML = '';
    return;
  }

  container.classList.add('active');

  const trackedOrder = state.trackedOrder;

  container.innerHTML = `
    <div class="checkout-modal-card" style="max-width: 600px;">
      <button class="modal-close-btn" id="btn-close-tracker">✕</button>

      <h2 style="font-size: 1.5rem; margin-bottom: 0.3rem;">📦 Live Order Tracking</h2>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
        Enter your KREID Consignment Tracking Number (e.g. TRX-8827419 or TCS-4412093).
      </p>

      <div style="display: flex; gap: 0.6rem; margin-bottom: 1.5rem;">
        <input type="text" id="tracking-input" placeholder="Tracking Number (e.g. TRX-8827419)" class="form-input" value="${trackedOrder ? trackedOrder.trackingNo : ''}" />
        <button class="btn btn-primary" id="btn-search-tracking" style="padding: 0.6rem 1.2rem;">Track</button>
      </div>

      ${trackedOrder ? `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-gold); padding: 1.5rem; border-radius: var(--radius-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.8rem;">
            <div>
              <div style="font-weight: 800; font-size: 1.1rem; color: #ffffff;">Order #${trackedOrder.id}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Tracking: ${trackedOrder.trackingNo} (${trackedOrder.courier})</div>
            </div>
            <span class="badge badge-gold">${trackedOrder.status}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem; position: relative; margin-left: 1rem; border-left: 2px solid var(--accent-gold); padding-left: 1.2rem;">
            <div style="position: relative;">
              <div style="position: absolute; left: -1.65rem; top: 0; width: 12px; height: 12px; border-radius: 50%; background: var(--accent-gold);"></div>
              <strong style="color: #ffffff;">1. Order Confirmed & Verified</strong>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${trackedOrder.date}</div>
            </div>

            <div style="position: relative;">
              <div style="position: absolute; left: -1.65rem; top: 0; width: 12px; height: 12px; border-radius: 50%; background: ${trackedOrder.status === 'Processing' || trackedOrder.status === 'Shipped' || trackedOrder.status === 'Delivered' ? 'var(--accent-gold)' : '#333'};"></div>
              <strong style="color: #ffffff;">2. Handed over to ${trackedOrder.courier}</strong>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Dispatch Hub: ${trackedOrder.city}</div>
            </div>

            <div style="position: relative;">
              <div style="position: absolute; left: -1.65rem; top: 0; width: 12px; height: 12px; border-radius: 50%; background: ${trackedOrder.status === 'Shipped' || trackedOrder.status === 'Delivered' ? 'var(--accent-gold)' : '#333'};"></div>
              <strong style="color: #ffffff;">3. Out for Delivery with Rider</strong>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Destination: ${trackedOrder.address}, ${trackedOrder.city}</div>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Attach Event Listeners
  container.querySelector('#btn-close-tracker')?.addEventListener('click', () => {
    appStore.toggleOrderTracker(false);
  });

  container.querySelector('#btn-search-tracking')?.addEventListener('click', () => {
    const input = container.querySelector('#tracking-input');
    if (input && input.value) {
      const cleanNo = input.value.trim().toUpperCase();
      const order = state.orders.find(o => o.trackingNo.toUpperCase() === cleanNo || o.id.toUpperCase() === cleanNo);
      if (order) {
        state.trackedOrder = order;
        renderOrderTracker(container, state);
      } else {
        alert(`No order found matching tracking number: ${cleanNo}. Please check your order confirmation receipt.`);
      }
    }
  });
}
