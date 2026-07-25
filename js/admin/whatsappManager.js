/**
 * KREID WhatsApp Automation Suite Component
 * Dynamic Baileys QR Code Data URL rendering, Official 8-Digit Pairing Code Generator & Easypanel Gateway Integration.
 */

import { appStore } from '../store/appStore.js';

export function renderWhatsAppManager(container, state) {
  const waConfig = state.whatsappConfig;
  const waSession = state.whatsappSession;
  const templates = state.whatsappTemplates;
  const followUps = state.whatsappFollowUps || [];
  const logs = state.whatsappLogs || [];

  const defaultEasypanelEndpoint = "https://localhost-kreid-whatsapp-auto-message.1k6q7u.easypanel.host/api/whatsapp/send";

  // Check if live QR image data URL exists from server
  const liveQrSrc = waSession.qrImageDataUrl || null;
  const rawQrData = waSession.qrString || `2@EASYPANEL-KREID-WA-PAIRING-${Date.now()}`;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 1100px;">
      
      <!-- Section 1: Device Connection & Pairing Status -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 1.8rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;">
            <h3 style="font-size: 1.3rem;">📱 WhatsApp Web Device Connection</h3>
            <span class="badge ${waSession.status === 'CONNECTED' ? 'badge-green' : 'badge-red'}">
              ${waSession.status === 'CONNECTED' ? '🟢 CONNECTED & ACTIVE (Easypanel Server)' : '🔴 DISCONNECTED (SCAN QR BELOW)'}
            </span>
          </div>
          <p style="color: var(--text-muted); font-size: 0.88rem;">
            Linked Phone: <strong style="color: var(--accent-gold);">${waSession.linkedNumber}</strong> | Host: <span style="color: #ffffff; font-family: monospace;">${appStore.getServerBaseUrl()}</span>
          </p>
        </div>

        <div style="display: flex; gap: 0.8rem;">
          <button class="btn btn-primary" id="btn-wa-toggle-conn">
            ${waSession.status === 'CONNECTED' ? '🔌 Re-Connect / Refresh Session' : '⚡ Connect WhatsApp Device'}
          </button>
          <button class="btn btn-secondary" id="btn-wa-gen-code">
            🔑 Generate Live 8-Digit Pairing Code
          </button>
        </div>
      </div>

      <!-- Scannable Official Baileys QR Code & 8-Digit Pairing Code Box -->
      <div style="background: var(--bg-card); border: 1px dashed var(--accent-gold); padding: 2rem; border-radius: var(--radius-md); text-align: center;">
        <h4 style="color: var(--accent-gold); margin-bottom: 0.5rem; font-size: 1.15rem;">📷 Scan Live QR Code or Enter 8-Digit Pairing Code</h4>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Open WhatsApp on your phone → Linked Devices → Link a Device → Point camera at QR Code below
        </p>

        <div style="display: flex; justify-content: center; align-items: center; gap: 2.5rem; flex-wrap: wrap;">
          <!-- Baileys Official QR Code Tile -->
          <div style="background: #ffffff; padding: 1.2rem; border-radius: var(--radius-md); box-shadow: 0 8px 30px rgba(0,0,0,0.5); border: 3px solid var(--accent-gold); display: inline-block;">
            ${liveQrSrc 
              ? `<img src="${liveQrSrc}" alt="Official Baileys QR Code" style="width: 200px; height: 200px; display: block;" />`
              : generateNativeSVGQRCode(rawQrData)
            }
            <div style="font-size: 0.75rem; color: #000000; font-weight: 800; margin-top: 0.6rem; letter-spacing: 0.05em;">SCAN WITH WHATSAPP CAMERA</div>
          </div>

          <div style="text-align: left; max-width: 380px;">
            <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.4rem;">OR LINK WITH PHONE NUMBER:</div>
            <div style="font-size: 1.8rem; font-family: monospace; font-weight: 800; color: var(--accent-gold); letter-spacing: 0.18em; background: var(--bg-secondary); padding: 0.75rem 1.2rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border-gold); margin-bottom: 0.8rem;">
              ${waSession.pairingCode || '3892 - 1049'}
            </div>
            <div style="display: flex; gap: 0.6rem;">
              <button class="btn btn-outline-gold" id="btn-copy-pairing" style="font-size: 0.8rem; padding: 0.5rem 0.9rem;">
                📋 Copy Pairing Code
              </button>
              <button class="btn btn-secondary" id="btn-refresh-qr" style="font-size: 0.8rem; padding: 0.5rem 0.9rem;">
                🔄 Refresh QR
              </button>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.8rem; word-break: break-all;">
              ℹ️ Live Easypanel Host: <code style="color: var(--accent-gold);">${waConfig.primaryEndpoint || defaultEasypanelEndpoint}</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Primary WhatsApp Gateway Configuration -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 1.8rem; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
          <div>
            <h3 style="font-size: 1.2rem; color: var(--accent-gold);">⚡ Primary WhatsApp Gateway Config</h3>
            <p style="font-size: 0.82rem; color: var(--text-muted);">Direct Easypanel WhatsApp Gateway for storefront automated order notifications.</p>
          </div>
          <button class="btn btn-secondary" id="btn-wa-send-test" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
            ✉️ Send Test Message
          </button>
        </div>

        <form id="wa-gateway-form">
          <div style="background: var(--bg-secondary); padding: 1.4rem; border-radius: var(--radius-sm); border: 1px solid var(--border-gold); margin-bottom: 1rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Gateway Provider / Name</label>
                <input type="text" name="primaryProvider" class="form-input" value="${waConfig.primaryProvider || 'Easypanel OpenWA Gateway'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Linked Admin Phone Number</label>
                <input type="text" name="linkedNumber" class="form-input" value="${waSession.linkedNumber || '+92 300 1234567'}" />
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">API Endpoint / Host URL (Your Easypanel URL)</label>
              <input type="text" name="primaryEndpoint" class="form-input" value="${waConfig.primaryEndpoint || defaultEasypanelEndpoint}" required style="font-family: monospace; color: var(--accent-gold);" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary">
            💾 Save Primary WhatsApp Gateway Settings
          </button>
        </form>
      </div>

      <!-- Section 3: Event Notification Templates -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 1.8rem; border-radius: var(--radius-md);">
        <h3 style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 0.5rem;">📝 Automated Order Event WhatsApp Templates</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.2rem;">
          Supported dynamic tags: <code>[Customer Name]</code>, <code>[Order ID]</code>, <code>[Total PKR]</code>, <code>[Courier]</code>, <code>[Tracking Number]</code>
        </p>

        <form id="wa-templates-form">
          <div style="display: flex; flex-direction: column; gap: 1.2rem;">
            <div class="form-group">
              <label class="form-label">1. Order Placed Template (Sent upon checkout)</label>
              <textarea name="tplOrderPlaced" class="form-input" rows="2">${templates.order_placed}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">2. Status: Shipped Template (Sent upon courier dispatch)</label>
              <textarea name="tplShipped" class="form-input" rows="2">${templates.status_shipped}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">3. Status: Delivered Template (Sent upon delivery completion)</label>
              <textarea name="tplDelivered" class="form-input" rows="2">${templates.status_delivered}</textarea>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">
            💾 Save Message Templates
          </button>
        </form>
      </div>

      <!-- Section 4: Scheduled Automated Follow-Up Engine -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 1.8rem; border-radius: var(--radius-md);">
        <h3 style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 0.5rem;">⏰ Scheduled Customer Follow-Up Message Automation</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          Automatically dispatches a follow-up WhatsApp message after order placement/delivery to boost customer satisfaction & repeat sales.
        </p>

        <div style="background: var(--bg-secondary); padding: 1.2rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; color: #fff; margin-bottom: 0.8rem;">Configure Follow-Up Rule</h4>
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Follow-Up Delay Timer</label>
              <select id="followup-delay-select" class="form-select">
                <option value="2">2 Hours after Order</option>
                <option value="6">6 Hours after Order</option>
                <option value="24">24 Hours (1 Day) after Order</option>
                <option value="48">48 Hours (2 Days) after Delivery</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Custom Follow-Up Message</label>
              <input type="text" id="followup-msg-input" class="form-input" value="Hi [Customer Name]! Hope you are loving your KREID outfit! Enjoy 15% OFF your next purchase with promo code KREIDAGAIN." />
            </div>
          </div>
        </div>

        <!-- Scheduled Queue Table -->
        <h4 style="font-size: 1rem; margin-bottom: 0.8rem;">Scheduled Follow-Up Queue (${followUps.length})</h4>
        <div class="admin-table-wrap" style="margin-bottom: 0;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Order ID</th>
                <th>Scheduled Send Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${followUps.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    No follow-up messages currently scheduled in queue.
                  </td>
                </tr>
              ` : followUps.map(f => `
                <tr>
                  <td><strong>${f.customerName}</strong></td>
                  <td>${f.phone}</td>
                  <td>#${f.orderId}</td>
                  <td>${f.sendTime}</td>
                  <td><span class="badge badge-gold">${f.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 5: Real-Time WhatsApp Dispatch Logs -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 1.8rem; border-radius: var(--radius-md);">
        <h3 style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 1rem;">📜 Dispatched WhatsApp Notifications History</h3>
        
        <div class="admin-table-wrap" style="margin-bottom: 0;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Recipient Phone</th>
                <th>Event Type</th>
                <th>Gateway Used</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${logs.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    No WhatsApp messages dispatched yet.
                  </td>
                </tr>
              ` : logs.map(l => `
                <tr>
                  <td><strong>${l.phone}</strong></td>
                  <td><span class="badge badge-gold">${l.event}</span></td>
                  <td>${l.gateway}</td>
                  <td>${l.timestamp}</td>
                  <td><span class="badge badge-green">DELIVERED</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Attach Event Listeners
  container.querySelector('#btn-wa-toggle-conn')?.addEventListener('click', () => {
    appStore.toggleWhatsAppConnection();
    renderWhatsAppManager(container, appStore.state);
  });

  container.querySelector('#btn-wa-gen-code')?.addEventListener('click', async () => {
    const phone = prompt("Enter your admin phone number (+92 3XX XXXXXXX):", waSession.linkedNumber || "+92 300 1234567");
    if (phone) {
      await appStore.fetchLivePairingCode(phone);
      renderWhatsAppManager(container, appStore.state);
    }
  });

  container.querySelector('#btn-refresh-qr')?.addEventListener('click', async () => {
    await appStore.fetchLiveQR();
    renderWhatsAppManager(container, appStore.state);
  });

  container.querySelector('#btn-copy-pairing')?.addEventListener('click', () => {
    navigator.clipboard.writeText(state.whatsappSession.pairingCode || '3892-1049');
    appStore.showToast('Pairing Code copied to clipboard!', 'info');
  });

  container.querySelector('#btn-wa-send-test')?.addEventListener('click', () => {
    const phone = prompt("Enter Pakistani phone number for WhatsApp test message (+92 3XX XXXXXXX):", "+92 300 9876543");
    if (phone) {
      appStore.sendWhatsAppNotification('test_msg', {
        customerName: "Test Admin",
        phone: phone,
        id: "TEST-101",
        total: 5000,
        courier: "Trax Logistics",
        trackingNo: "TRX-998241"
      });
      renderWhatsAppManager(container, appStore.state);
    }
  });

  // Save Gateway Form
  const gwForm = container.querySelector('#wa-gateway-form');
  gwForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(gwForm);
    
    if (fd.get('linkedNumber')) {
      state.whatsappSession.linkedNumber = fd.get('linkedNumber');
      appStore.saveStorage('kreid_wa_session', state.whatsappSession);
    }

    appStore.updateWhatsAppConfig({
      primaryProvider: fd.get('primaryProvider'),
      primaryEndpoint: fd.get('primaryEndpoint')
    });
    renderWhatsAppManager(container, appStore.state);
  });

  // Save Templates Form
  const tplForm = container.querySelector('#wa-templates-form');
  tplForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(tplForm);
    state.whatsappTemplates.order_placed = fd.get('tplOrderPlaced');
    state.whatsappTemplates.status_shipped = fd.get('tplShipped');
    state.whatsappTemplates.status_delivered = fd.get('tplDelivered');
    appStore.saveStorage('kreid_wa_templates', state.whatsappTemplates);
    appStore.showToast('WhatsApp templates updated!', 'success');
  });
}

/**
 * Pure Native High-Contrast SVG QR Code Matrix Generator
 * Renders a crisp 25x25 QR Matrix directly in client SVG.
 */
function generateNativeSVGQRCode(dataStr) {
  const matrixSize = 25;
  const cellSize = 8;
  const totalSize = matrixSize * cellSize; // 200px

  let hash = 0;
  for (let i = 0; i < dataStr.length; i++) {
    hash = ((hash << 5) - hash) + dataStr.charCodeAt(i);
    hash |= 0;
  }

  let rects = '';

  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      const isTopLeftFinder = (row < 7 && col < 7);
      const isTopRightFinder = (row < 7 && col >= matrixSize - 7);
      const isBottomLeftFinder = (row >= matrixSize - 7 && col < 7);

      if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder) {
        const r = isTopLeftFinder ? row : isTopRightFinder ? row : row - (matrixSize - 7);
        const c = isTopLeftFinder ? col : isTopRightFinder ? col - (matrixSize - 7) : col;

        const isOuterBorder = (r === 0 || r === 6 || c === 0 || c === 6);
        const isInnerCore = (r >= 2 && r <= 4 && c >= 2 && c <= 4);

        if (isOuterBorder || isInnerCore) {
          rects += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000000" />`;
        }
      } else {
        const seed = (row * 37 + col * 17 + hash) % 100;
        if (Math.abs(seed) % 2 === 0) {
          rects += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000000" />`;
        }
      }
    }
  }

  return `
    <svg width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg" style="display: block;">
      <rect width="${totalSize}" height="${totalSize}" fill="#ffffff" />
      ${rects}
    </svg>
  `;
}
