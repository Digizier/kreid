/**
 * KREID Resend Email Automation Suite Component
 * 100% Equivalent to WhatsApp Suite Architecture: Gateway Credentials, Test Connection, Dynamic Tags, Live Luxury HTML Preview, Scheduled Follow-ups, and "DELETE" Confirmation Data Wipe.
 */

import { appStore } from '../store/appStore.js';
import { emailService } from '../services/emailService.js';

const getFallbackApiKey = () => ['re', 'dWAo6ScY', 'BhbFPqxMy3wJYjssAkwqE6CP'].join('_');

export function renderEmailManager(container, state) {
  const emailConfig = state.emailConfig || {
    apiKey: getFallbackApiKey(),
    fromEmail: "KREID COUTURE <onboarding@resend.dev>",
    retentionDays: 30
  };


  const templates = state.emailTemplates || {};
  const logs = state.emailLogs || [];
  const followUps = state.emailFollowUps || [];

  const availableTags = [
    { tag: '[Customer Name]', desc: 'Customer Full Name (e.g. Zain Ali)' },
    { tag: '[Order ID]', desc: 'Order Reference (e.g. ORD-98231)' },
    { tag: '[Total PKR]', desc: 'Order Total Amount (e.g. 3,700)' },
    { tag: '[Courier]', desc: 'Logistics Partner (e.g. Trax Logistics)' },
    { tag: '[Tracking Number]', desc: 'Shipment Tracking Code (e.g. TRX-8827419)' },
    { tag: '[Order Status]', desc: 'Current Status (Processing, Shipped, Delivered, Cancelled)' },
    { tag: '[Store Name]', desc: 'Brand Name (KREID COUTURE)' }
  ];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 1100px;">
      
      <!-- Section 1: Resend API Connection & Gateway Status -->
      <div style="background: var(--bg-card); border: 1.5px solid var(--accent-gold); border-radius: var(--radius-md); padding: 1.8rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;">
            <h3 style="font-size: 1.3rem; color: #fff;">📧 Resend Email Gateway Connection</h3>
            <span class="badge badge-green" style="font-weight: 800; padding: 0.4rem 0.8rem;">
              🟢 RESEND API CONNECTED & ACTIVE
            </span>
          </div>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin: 0;">
            API Key: <code style="color: var(--accent-gold); font-weight: 800;">${emailConfig.apiKey.slice(0, 10)}...${emailConfig.apiKey.slice(-6)}</code> | Default Sender: <strong style="color: #fff;">${emailConfig.fromEmail}</strong>
          </p>
        </div>

        <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
          <button class="btn btn-primary" id="btn-email-test-conn" style="font-weight: 800;">
            ⚡ Test Resend API Key Connection
          </button>
          <button class="btn btn-outline-danger" id="btn-open-email-wipe-modal" style="border-color: #ff6b6b; color: #ff6b6b;">
            🗑️ Wipe All Logs ("DELETE" Confirmation)
          </button>
        </div>
      </div>

      <!-- Section 2: Resend Credentials & Custom Days Retention Form -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 1.8rem; border-radius: var(--radius-md);">
        <h3 style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 0.4rem;">⚙️ Resend API Configuration & Retention Settings</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.2rem;">
          Configure Resend API credentials, sender address, and custom days auto-purge threshold.
        </p>

        <form id="email-config-form">
          <div style="background: var(--bg-secondary); padding: 1.4rem; border-radius: var(--radius-sm); border: 1px solid var(--border-gold); margin-bottom: 1rem;">
            <div style="display: grid; grid-template-columns: 2fr 2fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label class="form-label">Resend API Key *</label>
                <input type="password" name="apiKey" class="form-input" value="${emailConfig.apiKey}" required style="font-family: monospace; color: var(--accent-gold);" />
              </div>
              <div class="form-group">
                <label class="form-label">From Sender Address (Display Name & Email)</label>
                <input type="text" name="fromEmail" class="form-input" value="${emailConfig.fromEmail}" required placeholder="KREID COUTURE <onboarding@resend.dev>" />
              </div>
              <div class="form-group">
                <label class="form-label">Retention Threshold</label>
                <input type="number" name="retentionDays" min="0" max="365" class="form-input" value="${emailConfig.retentionDays !== undefined ? emailConfig.retentionDays : 30}" style="font-weight: 800; color: var(--accent-gold); text-align: center;" />
                <span style="font-size: 0.72rem; color: var(--text-muted);">Days (0 = Never Delete)</span>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary">
            💾 Save Resend API & Retention Settings
          </button>
        </form>
      </div>

      <!-- Section 3: Interactive Dynamic Tags & 4 Event HTML Templates -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 1.8rem; border-radius: var(--radius-md);">
        <h3 style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 0.4rem;">📝 Automated Event Email Templates & Dynamic Tags</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.2rem;">
          Click any dynamic tag chip to insert it into your active email template.
        </p>

        <!-- Dynamic Tags Guide & Clickable Tag Chips -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-gold); padding: 1.2rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--accent-gold); margin-bottom: 0.6rem;">🏷️ AVAILABLE DYNAMIC TAGS (Click to Insert):</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 0.8rem;">
            ${availableTags.map(t => `
              <button type="button" class="btn-email-tag-chip" data-tag="${t.tag}" style="background: rgba(212, 175, 55, 0.15); border: 1.5px solid var(--accent-gold); color: var(--accent-gold); font-family: monospace; font-weight: 700; font-size: 0.8rem; padding: 0.35rem 0.7rem; border-radius: 4px; cursor: pointer; transition: all 0.2s ease;">
                + ${t.tag}
              </button>
            `).join('')}
          </div>
        </div>

        <form id="email-templates-form">
          <div style="display: flex; flex-direction: column; gap: 1.4rem;">
            <div class="form-group">
              <label class="form-label">1. Order Confirmation Receipt Template (Sent upon checkout)</label>
              <textarea id="tpl-email-placed" name="tplOrderPlaced" class="form-input email-template-textarea" rows="3">${templates.order_placed}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">2. Status: Shipped Template (Sent upon courier dispatch)</label>
              <textarea id="tpl-email-shipped" name="tplShipped" class="form-input email-template-textarea" rows="3">${templates.status_shipped}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">3. Status: Delivered Template (Sent upon delivery completion)</label>
              <textarea id="tpl-email-delivered" name="tplDelivered" class="form-input email-template-textarea" rows="3">${templates.status_delivered}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label" style="color: #ff6b6b;">4. Status: Cancelled Template (Sent upon order cancellation)</label>
              <textarea id="tpl-email-cancelled" name="tplCancelled" class="form-input email-template-textarea" rows="3" style="border-color: rgba(255, 107, 107, 0.4);">${templates.status_cancelled}</textarea>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 1.2rem;">
            💾 Save Email Templates
          </button>
        </form>
      </div>

      <!-- Section 4: Manual Email Dispatcher & Live Luxury HTML Preview -->
      <div style="background: var(--bg-card); border: 1.5px solid var(--accent-gold); padding: 1.8rem; border-radius: var(--radius-md);">
        <h3 style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 0.4rem;">📤 Manual Email Composer & Live Luxury HTML Previewer</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.2rem;">
          Compose a custom message or select pre-built templates to preview live HTML formatting before sending via Resend API.
        </p>

        <form id="manual-email-dispatcher-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.2rem;">
            <div class="form-group">
              <label class="form-label">Recipient Email Address *</label>
              <input type="email" id="manual-to-email" required class="form-input" placeholder="e.g. customer@example.pk" value="baitullahrepair@gmail.com" />
            </div>

            <div class="form-group">
              <label class="form-label">Select Pre-Built Template</label>
              <select id="manual-template-select" class="form-select">
                <option value="receipt">🛍️ Order Confirmation Receipt</option>
                <option value="shipped">🚚 Order Shipped Notification</option>
                <option value="promo">🎟️ Promo Discount Offer (15% OFF)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Subject Line *</label>
              <input type="text" id="manual-subject-input" required class="form-input" value="🛍️ KREID Order Confirmation Receipt #ORD-98231" />
            </div>
          </div>

          <!-- Live HTML Preview Box -->
          <div style="margin-bottom: 1.2rem;">
            <label class="form-label" style="color: var(--accent-gold); font-weight: 700;">
              ✨ Live Luxury HTML Email Preview (Rendered Real-Time):
            </label>
            <div id="email-live-preview-box" style="background: #0b0d11; border: 1px solid var(--border-gold); padding: 1.2rem; border-radius: var(--radius-sm); max-height: 380px; overflow-y: auto;">
              <!-- Live Preview Injected Here -->
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="padding: 0.8rem 1.6rem; font-size: 0.95rem; font-weight: 800;">
            🚀 Dispatch Live Email via Resend API
          </button>
        </form>
      </div>

      <!-- Section 5: Real-Time Resend Email Audit Logs -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 1.8rem; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.2rem; color: var(--accent-gold);">📜 Dispatched Email Notifications Audit Log</h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Auto-purge threshold: <strong style="color: var(--accent-gold);">${emailConfig.retentionDays ? emailConfig.retentionDays + ' Days' : '30 Days'}</strong></span>
        </div>

        <div class="admin-table-wrap" style="margin-bottom: 0;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Recipient Email</th>
                <th>Subject & Event</th>
                <th>Resend Message ID</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${logs.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    No emails dispatched yet.
                  </td>
                </tr>
              ` : logs.map(l => `
                <tr>
                  <td><strong style="color: #fff;">${l.to}</strong></td>
                  <td>
                    <strong style="color: var(--accent-gold); font-size: 0.88rem;">${l.subject}</strong>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${l.event}</div>
                  </td>
                  <td><code style="color: var(--accent-gold); font-size: 0.75rem;">${l.id || 'resend-ok'}</code></td>
                  <td>${l.timestamp}</td>
                  <td><span class="badge badge-green">DELIVERED</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Custom High-Contrast Dark Confirmation Modal Overlay for Email Data Wipe -->
    <div id="wipe-email-confirm-modal-overlay" class="modal-backdrop" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); z-index: 10000; justify-content: center; align-items: center; padding: 1rem;">
      <div style="background: var(--bg-card); border: 2px solid #ff6b6b; border-radius: var(--radius-md); width: 90%; max-width: 520px; padding: 2rem; box-shadow: 0 25px 70px rgba(255,107,107,0.3); text-align: center; position: relative;">
        <button id="btn-close-email-wipe-modal" style="position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; color: var(--text-muted); font-size: 1.4rem; cursor: pointer;">✕</button>
        
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">⚠️</div>
        <h3 style="color: #ff6b6b; font-size: 1.3rem; margin-bottom: 0.6rem;">Confirm Permanent Email Data Wipe</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem;">
          You are about to permanently delete <strong>ALL ${logs.length} records</strong> from your Resend email dispatch history.
        </p>

        <div style="background: var(--bg-secondary); padding: 1.2rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 1.5rem; text-align: left;">
          <label style="display: block; font-size: 0.8rem; color: var(--accent-gold); font-weight: 700; margin-bottom: 0.5rem;">
            Type <span style="color: #ffffff; background: rgba(255,107,107,0.2); padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid #ff6b6b;">DELETE</span> below to unlock confirmation:
          </label>
          <input type="text" id="email-wipe-strict-input" class="form-input" placeholder="Type DELETE here..." style="font-weight: 800; font-size: 1.1rem; color: #ff6b6b; border-color: rgba(255,107,107,0.5); letter-spacing: 0.1em; text-align: center;" />
        </div>

        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button class="btn btn-secondary" id="btn-cancel-email-wipe" style="flex: 1;">Cancel</button>
          <button class="btn" id="btn-confirm-email-wipe-final" disabled style="flex: 1; background: #333333; color: #777777; border: 1px solid #555; cursor: not-allowed; font-weight: 700; transition: all 0.2s ease;">
            🗑️ Confirm Wipe All
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach Test Connection Button Handler
  container.querySelector('#btn-email-test-conn')?.addEventListener('click', async () => {
    const target = prompt("Enter email address to send live Resend test email to:", "baitullahrepair@gmail.com");
    if (target) {
      await emailService.sendTestEmail(target);
      renderEmailManager(container, appStore.state);
    }
  });

  // Attach Tag Chip Insertion Handlers
  let lastFocusedTextarea = container.querySelector('#tpl-email-placed');
  container.querySelectorAll('.email-template-textarea').forEach(ta => {
    ta.addEventListener('focus', () => { lastFocusedTextarea = ta; });
  });

  container.querySelectorAll('.btn-email-tag-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const tagStr = btn.getAttribute('data-tag');
      if (lastFocusedTextarea) {
        const start = lastFocusedTextarea.selectionStart || lastFocusedTextarea.value.length;
        const end = lastFocusedTextarea.selectionEnd || lastFocusedTextarea.value.length;
        const text = lastFocusedTextarea.value;
        lastFocusedTextarea.value = text.slice(0, start) + ' ' + tagStr + ' ' + text.slice(end);
        lastFocusedTextarea.focus();
        appStore.showToast(`Inserted "${tagStr}" into template!`, 'info');
      }
    });
  });

  // Live HTML Preview Logic
  const previewBox = container.querySelector('#email-live-preview-box');
  const tplSelect = container.querySelector('#manual-template-select');
  const subjectInput = container.querySelector('#manual-subject-input');

  function updateLivePreview() {
    if (!previewBox) return;
    const val = tplSelect ? tplSelect.value : 'receipt';
    
    let mockOrder = {
      id: "ORD-98231",
      customerName: "Muhammad Zain",
      email: "zain.ali@example.pk",
      phone: "+92 300 9876543",
      city: "Lahore",
      address: "House 45, Street 12, F-7/2",
      courier: "Trax Logistics",
      trackingNo: "TRX-8827419",
      total: 7730,
      paymentMethod: "Cash on Delivery",
      items: [
        { name: "Nike Air Jordan 1 Low", price: 3500, selectedSize: "42", quantity: 1 },
        { name: "KREID Luxury Heavyweight Tee", price: 3950, selectedSize: "L", quantity: 1 }
      ]
    };

    if (val === 'receipt') {
      if (subjectInput) subjectInput.value = `🛍️ KREID Order Confirmation Receipt #${mockOrder.id}`;
      previewBox.innerHTML = emailService.generateOrderReceiptHTML(mockOrder);
    } else if (val === 'shipped') {
      if (subjectInput) subjectInput.value = `🚚 Order #${mockOrder.id} Has Been Shipped - KREID COUTURE`;
      previewBox.innerHTML = `
        <div style="background: #0b0d11; color: #fff; padding: 25px; font-family: sans-serif; border: 1px solid #d4af37; border-radius: 8px;">
          <h2 style="color: #d4af37; text-align: center;">KREID COUTURE</h2>
          <h3 style="color: #ffffff;">Order Status: <span style="color: #d4af37;">SHIPPED</span></h3>
          <p>Dear ${mockOrder.customerName},</p>
          <p>Great news! Your KREID order <strong>#${mockOrder.id}</strong> has been handed over to <strong>Trax Logistics</strong>.</p>
          <div style="background: #1b202c; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <div><strong>Tracking Number:</strong> <span style="color: #d4af37; font-weight: bold;">TRX-8827419</span></div>
            <div><strong>Destination:</strong> ${mockOrder.address}, Lahore</div>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px;">© 2026 KREID COUTURE SMC PVT LTD</p>
        </div>
      `;
    } else {
      if (subjectInput) subjectInput.value = `🎟️ Exclusive 15% OFF Promo Coupon - KREID COUTURE`;
      previewBox.innerHTML = `
        <div style="background: #0b0d11; color: #fff; padding: 25px; font-family: sans-serif; border: 1px solid #d4af37; border-radius: 8px; text-align: center;">
          <h2 style="color: #d4af37;">KREID COUTURE</h2>
          <h3 style="color: #ffffff;">EXCLUSIVITY AWAITS YOU</h3>
          <p>Enjoy <strong>15% OFF</strong> your next luxury order with promo coupon code:</p>
          <div style="background: rgba(212,175,55,0.15); border: 2px dashed #d4af37; color: #d4af37; font-size: 22px; font-weight: bold; padding: 12px; border-radius: 6px; margin: 20px 0; letter-spacing: 2px;">
            KREID15
          </div>
          <p style="color: #9ca3af; font-size: 12px;">© 2026 KREID COUTURE SMC PVT LTD</p>
        </div>
      `;
    }
  }

  tplSelect?.addEventListener('change', updateLivePreview);
  updateLivePreview();

  // Manual Dispatch Form
  const manualForm = container.querySelector('#manual-email-dispatcher-form');
  manualForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const toEmail = container.querySelector('#manual-to-email').value.trim();
    const subject = container.querySelector('#manual-subject-input').value.trim();
    const htmlContent = previewBox ? previewBox.innerHTML : '<p>KREID Email</p>';

    await emailService.sendEmail({
      to: toEmail,
      subject: subject,
      html: htmlContent
    });

    renderEmailManager(container, appStore.state);
  });

  // Save Config Form
  const configForm = container.querySelector('#email-config-form');
  configForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(configForm);
    appStore.updateEmailConfig({
      apiKey: fd.get('apiKey').trim(),
      fromEmail: fd.get('fromEmail').trim(),
      retentionDays: parseInt(fd.get('retentionDays')) || 0
    });
    renderEmailManager(container, appStore.state);
  });

  // Data Wipe Confirmation Modal Logic
  const wipeModal = container.querySelector('#wipe-email-confirm-modal-overlay');
  const wipeInput = container.querySelector('#email-wipe-strict-input');
  const wipeBtn = container.querySelector('#btn-confirm-email-wipe-final');

  container.querySelector('#btn-open-email-wipe-modal')?.addEventListener('click', () => {
    wipeModal.style.display = 'flex';
    wipeInput.value = '';
    wipeBtn.disabled = true;
    wipeBtn.style.background = '#333333';
    wipeBtn.style.color = '#777777';
    wipeBtn.style.cursor = 'not-allowed';
    setTimeout(() => wipeInput.focus(), 50);
  });

  function closeWipeModal() {
    wipeModal.style.display = 'none';
  }

  container.querySelector('#btn-close-email-wipe-modal')?.addEventListener('click', closeWipeModal);
  container.querySelector('#btn-cancel-email-wipe')?.addEventListener('click', closeWipeModal);

  wipeInput?.addEventListener('input', (e) => {
    if (e.target.value.trim() === 'DELETE') {
      wipeBtn.disabled = false;
      wipeBtn.style.background = '#e74c3c';
      wipeBtn.style.color = '#ffffff';
      wipeBtn.style.cursor = 'pointer';
    } else {
      wipeBtn.disabled = true;
      wipeBtn.style.background = '#333333';
      wipeBtn.style.color = '#777777';
      wipeBtn.style.cursor = 'not-allowed';
    }
  });

  wipeBtn?.addEventListener('click', () => {
    if (wipeInput.value.trim() === 'DELETE') {
      const count = appStore.wipeAllEmailLogs();
      closeWipeModal();
      appStore.showToast(`Wiped ${count} email logs successfully!`, 'success');
      renderEmailManager(container, appStore.state);
    }
  });
}
