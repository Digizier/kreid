/**
 * Multi-Step Pakistani Checkout Modal Component
 * Step 1: Customer Info & City
 * Step 2: Courier Logistics Selection (TCS, Trax, Leopards)
 * Step 3: Pakistani Payment Method (COD, JazzCash, EasyPaisa, SadaPay/NayaPay, Bank Transfer) + Account Details + Mandatory Proof Screenshot Upload + 2hr Notice
 * Step 4: Receipt & Consignment Tracking Generator
 */

import { appStore } from '../store/appStore.js';

let paymentProofBase64 = null;

export function renderCheckoutModal(container, state) {
  const isOpen = state.isCheckoutOpen;
  const cartTotal = appStore.getCartTotal();
  const paySettings = state.paymentSettings;

  if (!isOpen) {
    container.classList.remove('active');
    container.innerHTML = '';
    paymentProofBase64 = null;
    return;
  }

  container.classList.add('active');

  container.innerHTML = `
    <div class="checkout-modal-card">
      <button class="modal-close-btn" id="btn-close-checkout">✕</button>

      <h2 style="font-size: 1.6rem; margin-bottom: 0.3rem;">KREID Express Checkout</h2>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
        Complete your order below for fast delivery across Pakistan.
      </p>

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

          <!-- Dynamic Digital Payment Account Details & Screenshot Upload Box -->
          <div id="digital-payment-details-box" style="display: none; background: rgba(212, 175, 55, 0.08); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md); padding: 1.4rem;">
            <div id="payment-instructions-content"></div>

            <!-- Upload Screenshot Box -->
            <div style="margin-top: 1.2rem; border-top: 1px dashed var(--border-gold); padding-top: 1rem;">
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

  // Attach Change & Click Listeners to All Payment Radios and Parent Cards
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

  // Attach Proof File Input Reader
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
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Close Checkout Modal
  container.querySelector('#btn-close-checkout')?.addEventListener('click', () => {
    appStore.toggleCheckout(false);
  });

  // Submit Order Form with Mandatory Payment Proof Validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const selectedPay = formData.get('paymentMethod');

    // Strict Validation: If digital payment selected, paymentProofBase64 MUST NOT be null!
    if (selectedPay !== 'Cash on Delivery' && !paymentProofBase64) {
      alert(`⚠️ PAYMENT PROOF SCREENSHOT REQUIRED!\n\nYou selected ${selectedPay}. Please attach a screenshot of your payment transfer before proceeding with your order.`);
      proofInput?.focus();
      proofInput?.scrollIntoView({ behavior: 'smooth' });
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

    const newOrder = appStore.createOrder(orderDetails);
    paymentProofBase64 = null;
    appStore.toggleCheckout(false);

    alert(`🎉 ALHAMDULILLAH! YOUR ORDER HAS BEEN PLACED SUCCESSFULLY!\n\nOrder ID: #${newOrder.id}\nConsignment Tracking #: ${newOrder.trackingNo}\nCourier: ${newOrder.courier}\nPayment Method: ${newOrder.paymentMethod}\nTotal Amount: PKR ${newOrder.total.toLocaleString()}\n\n${selectedPay !== 'Cash on Delivery' ? '💬 Our support team will verify your payment proof screenshot and confirm your order via WhatsApp / Call within 2 hours!' : ''}`);
  });
}
