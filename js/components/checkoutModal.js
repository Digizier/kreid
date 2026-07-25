/**
 * Multi-Step Pakistani Checkout & Consignment Confirmation Suite
 * Featuring High-Contrast Local UI Error Alerts (No Browser Alerts) & Local Order Confirmation Receipt Modal
 */

import { appStore } from '../store/appStore.js';

let paymentProofBase64 = null;
let confirmedOrderData = null;

export function renderCheckoutModal(container, state) {
  const isOpen = state.isCheckoutOpen;
  const cartTotal = appStore.getCartTotal();
  const paySettings = state.paymentSettings;

  if (!isOpen) {
    container.classList.remove('active');
    container.innerHTML = '';
    paymentProofBase64 = null;
    confirmedOrderData = null;
    return;
  }

  container.classList.add('active');

  // If order is confirmed, render Local Order Confirmation Receipt UI!
  if (confirmedOrderData) {
    renderLocalOrderConfirmationUI(container, confirmedOrderData);
    return;
  }

  container.innerHTML = `
    <div class="checkout-modal-card">
      <button class="modal-close-btn" id="btn-close-checkout">✕</button>

      <h2 style="font-size: 1.6rem; margin-bottom: 0.3rem;">KREID Express Checkout</h2>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
        Complete your order below for fast delivery across Pakistan.
      </p>

      <!-- Local UI Payment Proof Error Banner -->
      <div id="payment-proof-error-banner" style="display: none; background: rgba(231,76,60,0.15); border: 2px solid #ff6b6b; border-radius: var(--radius-md); padding: 1rem 1.2rem; margin-bottom: 1.5rem; box-shadow: 0 0 25px rgba(255,107,107,0.35);">
        <div style="display: flex; align-items: flex-start; gap: 0.9rem;">
          <div style="font-size: 1.8rem; color: #ff6b6b; line-height: 1;">⚠️</div>
          <div>
            <h4 style="color: #ff6b6b; font-size: 1rem; font-weight: 800; margin-bottom: 0.2rem;">PAYMENT PROOF SCREENSHOT REQUIRED</h4>
            <p id="payment-proof-error-msg" style="color: #ffffff; font-size: 0.85rem; margin: 0; line-height: 1.4;">
              Please attach your transaction screenshot before submitting your order.
            </p>
          </div>
        </div>
      </div>

      <form id="checkout-form">
        <!-- Section 1: Shipping Address -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.05rem; color: var(--accent-gold); margin-bottom: 1rem;">1. Shipping & Customer Details</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" name="customerName" required placeholder="e.g. Zain Ali" class="form-input" value="Muhammad Zain" />
            </div>

            <div class="form-group">
              <label class="form-label">Pakistani Mobile Number *</label>
              <input type="tel" name="phone" required placeholder="+92 300 1234567" class="form-input" value="+92 300 9876543" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input type="email" name="email" required placeholder="name@domain.com" class="form-input" value="zain.ali@example.pk" />
            </div>

            <div class="form-group">
              <label class="form-label">City *</label>
              <select name="city" class="form-select" required>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Multan">Multan</option>
                <option value="Quetta">Quetta</option>
                <option value="Sialkot">Sialkot</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Complete Street Address *</label>
            <input type="text" name="address" required placeholder="House/Flat #, Street #, Sector/Area" class="form-input" value="House 45, Street 12, F-7/2" />
          </div>
        </div>

        <!-- Section 2: Courier Logistics Selector -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.05rem; color: var(--accent-gold); margin-bottom: 1rem;">2. Preferred Courier Service</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem;">
            <label style="background: var(--bg-secondary); border: 1px solid var(--border-gold); padding: 0.8rem; border-radius: var(--radius-sm); cursor: pointer; text-align: center;">
              <input type="radio" name="courier" value="Trax Logistics" checked />
              <div style="font-weight: 700; font-size: 0.9rem; margin-top: 0.3rem;">Trax Logistics</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">1-3 Days Express</div>
            </label>

            <label style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 0.8rem; border-radius: var(--radius-sm); cursor: pointer; text-align: center;">
              <input type="radio" name="courier" value="TCS Express" />
              <div style="font-weight: 700; font-size: 0.9rem; margin-top: 0.3rem;">TCS Express</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">24-48hrs Delivery</div>
            </label>

            <label style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 0.8rem; border-radius: var(--radius-sm); cursor: pointer; text-align: center;">
              <input type="radio" name="courier" value="Leopards Courier" />
              <div style="font-weight: 700; font-size: 0.9rem; margin-top: 0.3rem;">Leopards Courier</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">2-3 Days Standard</div>
            </label>
          </div>
        </div>

        <!-- Section 3: Pakistani Payment Method -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.05rem; color: var(--accent-gold); margin-bottom: 1rem;">3. Select Payment Method</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1.2rem;">
            <label class="pay-option-card" style="background: var(--bg-secondary); border: 1px solid var(--border-gold); padding: 0.9rem; border-radius: var(--radius-sm); cursor: pointer;">
              <input type="radio" name="paymentMethod" value="Cash on Delivery" checked />
              <strong style="margin-left: 0.4rem; font-size: 0.92rem;">💵 Cash on Delivery (COD)</strong>
            </label>

            <label class="pay-option-card" style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 0.9rem; border-radius: var(--radius-sm); cursor: pointer;">
              <input type="radio" name="paymentMethod" value="JazzCash" />
              <strong style="margin-left: 0.4rem; font-size: 0.92rem;">📱 JazzCash Mobile Wallet</strong>
            </label>

            <label class="pay-option-card" style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 0.9rem; border-radius: var(--radius-sm); cursor: pointer;">
              <input type="radio" name="paymentMethod" value="EasyPaisa" />
              <strong style="margin-left: 0.4rem; font-size: 0.92rem;">📲 EasyPaisa Mobile Wallet</strong>
            </label>

            <label class="pay-option-card" style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 0.9rem; border-radius: var(--radius-sm); cursor: pointer;">
              <input type="radio" name="paymentMethod" value="SadaPay / NayaPay" />
              <strong style="margin-left: 0.4rem; font-size: 0.92rem;">💳 SadaPay / NayaPay</strong>
            </label>

            <label class="pay-option-card" style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 0.9rem; border-radius: var(--radius-sm); cursor: pointer; grid-column: span 2;">
              <input type="radio" name="paymentMethod" value="Pakistani Bank Transfer" />
              <strong style="margin-left: 0.4rem; font-size: 0.92rem;">🏦 Pakistani Bank Account Transfer</strong>
            </label>
          </div>

          <!-- Dynamic Digital Payment Details & Screenshot Upload Box -->
          <div id="digital-payment-details-box" style="display: none; background: rgba(212, 175, 55, 0.08); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md); padding: 1.4rem; transition: all 0.3s ease;">
            <div id="payment-instructions-content"></div>

            <!-- Upload Screenshot Box -->
            <div id="proof-upload-container" style="margin-top: 1.2rem; border-top: 1px dashed var(--border-gold); padding-top: 1rem;">
              <label class="form-label" style="color: var(--accent-gold); font-weight: 700; font-size: 0.95rem;">
                📸 Attach Payment Proof Screenshot * (Mandatory for digital payments)
              </label>
              <input type="file" id="payment-proof-file-input" accept="image/*" class="form-input" style="padding: 0.6rem; background: var(--bg-secondary); cursor: pointer;" />
              
              <div id="proof-img-preview" style="margin-top: 0.8rem; display: none;">
                <img id="proof-img-elem" style="max-width: 200px; max-height: 140px; object-fit: contain; border-radius: var(--radius-sm); border: 2px solid var(--accent-gold);" />
                <div style="font-size: 0.8rem; color: var(--accent-green); margin-top: 0.3rem; font-weight: 700;">✓ Payment proof screenshot attached!</div>
              </div>
            </div>

            <!-- 2-Hour Verification Notice -->
            <div style="margin-top: 1.2rem; background: rgba(0,0,0,0.4); border-left: 4px solid var(--accent-gold); padding: 0.9rem 1.1rem; border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--accent-gold-light); line-height: 1.5;">
              💬 <strong>Verification Notice:</strong> Once you submit your order with payment proof attached, our support team will verify your transfer and update/confirm your order via <strong>WhatsApp or Phone Call</strong> within <strong>2 hours</strong>!
            </div>
          </div>
        </div>

        <!-- Order Total Banner -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-primary); border: 1px solid var(--accent-gold); padding: 1rem 1.2rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
          <span style="font-size: 1.1rem; font-weight: 700;">Total Payable Amount:</span>
          <span style="font-size: 1.5rem; font-weight: 800; color: var(--accent-gold);">PKR ${cartTotal.toLocaleString()}</span>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem;">
          ⚡ Confirm Order & Generate Consignment Tracking
        </button>
      </form>
    </div>
  `;

  const detailsBox = container.querySelector('#digital-payment-details-box');
  const instructionsContent = container.querySelector('#payment-instructions-content');
  const errorBanner = container.querySelector('#payment-proof-error-banner');
  const errorMsg = container.querySelector('#payment-proof-error-msg');
  const proofContainer = container.querySelector('#proof-upload-container');
  const form = container.querySelector('#checkout-form');

  function updatePaymentDisplay(selectedVal) {
    const cards = container.querySelectorAll('.pay-option-card');
    cards.forEach(card => {
      const radio = card.querySelector('input');
      if (radio && radio.value === selectedVal) {
        card.style.borderColor = 'var(--accent-gold)';
        card.style.background = 'rgba(212, 175, 55, 0.15)';
      } else {
        card.style.borderColor = 'var(--border-light)';
        card.style.background = 'var(--bg-secondary)';
      }
    });

    if (selectedVal === 'Cash on Delivery') {
      detailsBox.style.display = 'none';
    } else {
      detailsBox.style.display = 'block';
      if (selectedVal === 'JazzCash') {
        instructionsContent.innerHTML = `
          <h4 style="color: var(--accent-gold); margin-bottom: 0.5rem; font-size: 1.05rem;">📱 JazzCash Account Transfer Details:</h4>
          <div style="font-size: 0.95rem; margin-bottom: 0.3rem;"><strong>Account Title:</strong> ${paySettings.jazzcash.title}</div>
          <div style="font-size: 1.15rem; color: #fff;"><strong>JazzCash Mobile Number:</strong> <span style="color: var(--accent-gold); font-weight: 800;">${paySettings.jazzcash.number}</span></div>
        `;
      } else if (selectedVal === 'EasyPaisa') {
        instructionsContent.innerHTML = `
          <h4 style="color: var(--accent-gold); margin-bottom: 0.5rem; font-size: 1.05rem;">📲 EasyPaisa Account Transfer Details:</h4>
          <div style="font-size: 0.95rem; margin-bottom: 0.3rem;"><strong>Account Title:</strong> ${paySettings.easypaisa.title}</div>
          <div style="font-size: 1.15rem; color: #fff;"><strong>EasyPaisa Mobile Number:</strong> <span style="color: var(--accent-gold); font-weight: 800;">${paySettings.easypaisa.number}</span></div>
        `;
      } else if (selectedVal === 'SadaPay / NayaPay') {
        instructionsContent.innerHTML = `
          <h4 style="color: var(--accent-gold); margin-bottom: 0.5rem; font-size: 1.05rem;">💳 SadaPay / NayaPay Transfer Details:</h4>
          <div style="font-size: 0.95rem; margin-bottom: 0.3rem;"><strong>Account Title:</strong> ${paySettings.sadapay.title}</div>
          <div style="font-size: 1.15rem; color: #fff;"><strong>SadaPay Mobile Number:</strong> <span style="color: var(--accent-gold); font-weight: 800;">${paySettings.sadapay.number}</span></div>
        `;
      } else if (selectedVal === 'Pakistani Bank Transfer') {
        instructionsContent.innerHTML = `
          <h4 style="color: var(--accent-gold); margin-bottom: 0.5rem; font-size: 1.05rem;">🏦 Pakistani Bank Account Transfer Details:</h4>
          <div style="font-size: 0.95rem; margin-bottom: 0.3rem;"><strong>Bank Name:</strong> ${paySettings.bank.bankName}</div>
          <div style="font-size: 0.95rem; margin-bottom: 0.3rem;"><strong>Account Title:</strong> ${paySettings.bank.title}</div>
          <div style="font-size: 1.1rem; color: #fff;"><strong>IBAN Number:</strong> <span style="color: var(--accent-gold); font-family: monospace; font-weight: 800;">${paySettings.bank.iban}</span></div>
        `;
      }
    }
  }

  form.addEventListener('change', (e) => {
    if (e.target.name === 'paymentMethod') {
      updatePaymentDisplay(e.target.value);
    }
  });

  const cards = container.querySelectorAll('.pay-option-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input');
      if (radio) {
        radio.checked = true;
        updatePaymentDisplay(radio.value);
      }
    });
  });

  const proofInput = container.querySelector('#payment-proof-file-input');
  const proofPreview = container.querySelector('#proof-img-preview');
  const proofImg = container.querySelector('#proof-img-elem');

  if (proofInput) {
    proofInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          paymentProofBase64 = evt.target.result;
          proofImg.src = paymentProofBase64;
          proofPreview.style.display = 'block';
          errorBanner.style.display = 'none';
          if (proofContainer) proofContainer.style.border = 'none';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  container.querySelector('#btn-close-checkout')?.addEventListener('click', () => {
    appStore.toggleCheckout(false);
  });

  // Form Submission Handler with Local UI Error Box & Local Order Confirmation UI
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const selectedPay = formData.get('paymentMethod');

    // High-End Local UI Validation Error Banner
    if (selectedPay !== 'Cash on Delivery' && !paymentProofBase64) {
      errorMsg.innerHTML = `You selected <strong>${selectedPay}</strong>. Please attach your transaction screenshot before submitting your order.`;
      errorBanner.style.display = 'block';
      if (proofContainer) {
        proofContainer.style.border = '2px solid #ff6b6b';
        proofContainer.style.borderRadius = '8px';
        proofContainer.style.padding = '1rem';
      }
      errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const orderDetails = {
      customerName: formData.get('customerName'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      city: formData.get('city'),
      address: formData.get('address'),
      courier: formData.get('courier'),
      paymentMethod: selectedPay,
      paymentProof: paymentProofBase64 || null
    };

    confirmedOrderData = appStore.createOrder(orderDetails);
    paymentProofBase64 = null;
    renderCheckoutModal(container, appStore.state);
  });
}

/**
 * Local Order Confirmation Receipt UI Component
 * Replaces old browser alerts with a stunning dark luxury order receipt modal.
 */
function renderLocalOrderConfirmationUI(container, order) {
  const isDigital = order.paymentMethod !== 'Cash on Delivery';

  container.innerHTML = `
    <div class="checkout-modal-card" style="max-width: 680px; padding: 2.2rem;">
      <button class="modal-close-btn" id="btn-close-confirmation">✕</button>

      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width: 70px; height: 70px; background: rgba(46, 204, 113, 0.15); border: 2.5px solid var(--accent-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; color: var(--accent-green); margin: 0 auto 0.8rem; box-shadow: 0 0 30px rgba(46,204,113,0.3);">
          ✓
        </div>
        <h2 style="font-size: 1.6rem; color: #ffffff; margin-bottom: 0.3rem;">ALHAMDULILLAH! ORDER CONFIRMED</h2>
        <p style="color: var(--accent-gold); font-weight: 700; font-size: 0.95rem;">
          Thank you for choosing KREID COUTURE!
        </p>
      </div>

      <!-- Order ID & Tracking Reference Card -->
      <div style="background: var(--bg-secondary); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md); padding: 1.2rem 1.4rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">ORDER REFERENCE ID</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: #ffffff; font-family: monospace;">#${order.id}</div>
        </div>

        <div>
          <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">CONSIGNMENT TRACKING #</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--accent-gold); font-family: monospace;">${order.trackingNo}</div>
        </div>
      </div>

      <!-- Shipping & Payment Breakdown -->
      <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1.5rem;">
        <h4 style="color: var(--accent-gold); font-size: 0.98rem; margin-bottom: 0.8rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.4rem;">
          📦 Order Delivery Summary
        </h4>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.88rem; margin-bottom: 1rem;">
          <div>
            <span style="color: var(--text-muted);">Customer:</span> <strong style="color: #fff;">${order.customerName}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted);">Phone:</span> <strong style="color: #fff;">${order.phone}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted);">Courier:</span> <strong style="color: #fff;">${order.courier}</strong>
          </div>
          <div>
            <span style="color: var(--text-muted);">Destination City:</span> <strong style="color: #fff;">${order.city}</strong>
          </div>
          <div style="grid-column: span 2;">
            <span style="color: var(--text-muted);">Address:</span> <strong style="color: #fff;">${order.address}</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-primary); padding: 0.8rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Payment Method</div>
            <strong style="color: #fff; font-size: 0.95rem;">${order.paymentMethod}</strong>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: var(--text-muted);">Total Amount Paid</div>
            <strong style="color: var(--accent-gold); font-size: 1.2rem;">PKR ${order.total.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <!-- Live WhatsApp Dispatch Notification Notice -->
      <div style="background: rgba(46, 204, 113, 0.08); border-left: 4px solid var(--accent-green); padding: 1rem 1.2rem; border-radius: var(--radius-sm); font-size: 0.85rem; color: #ffffff; line-height: 1.5; margin-bottom: 1.5rem;">
        💬 <strong>WhatsApp Order Confirmation:</strong> An automated WhatsApp order receipt has been dispatched to <strong>${order.phone}</strong> via your Easypanel WhatsApp Gateway server!
        ${isDigital ? `<br/><br/>ℹ️ <em>Our team will verify your payment proof screenshot and confirm your consignment dispatch within 2 hours.</em>` : ''}
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 1rem;">
        <button class="btn btn-secondary" id="btn-track-confirmed-order" style="flex: 1; padding: 0.9rem;">
          🚚 Track Live Order Status
        </button>
        <button class="btn btn-primary" id="btn-continue-shopping" style="flex: 1; padding: 0.9rem;">
          🛍️ Continue Shopping
        </button>
      </div>
    </div>
  `;

  container.querySelector('#btn-close-confirmation')?.addEventListener('click', () => {
    confirmedOrderData = null;
    appStore.toggleCheckout(false);
  });

  container.querySelector('#btn-continue-shopping')?.addEventListener('click', () => {
    confirmedOrderData = null;
    appStore.toggleCheckout(false);
  });

  container.querySelector('#btn-track-confirmed-order')?.addEventListener('click', () => {
    const targetOrder = confirmedOrderData;
    confirmedOrderData = null;
    appStore.toggleCheckout(false);
    appStore.state.trackedOrder = targetOrder;
    appStore.toggleOrderTracker(true);
  });
}
