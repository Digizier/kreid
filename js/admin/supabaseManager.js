/**
 * KREID COUTURE — Supabase Database Settings UI Manager
 * Displays real-time database connection status, configuration forms, schema tools, and local data migration utilities.
 */

import { appStore } from '../store/appStore.js';

export function renderSupabaseManager(container, state) {
  const session = state.supabaseSession;
  
  const statusHtml = session.status === 'CONNECTED'
    ? `<span class="status-pill shipped" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">🟢 CONNECTED</span>`
    : session.status === 'PROCEEDING_TO_SETUP'
    ? `<span class="status-pill processing" style="font-size: 0.85rem; padding: 0.4rem 0.8rem; animation: pulse 1.5s infinite;">🟡 CONNECTING...</span>`
    : `<span class="status-pill cancelled" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">🔴 DISCONNECTED</span>`;

  const statsHtml = session.status === 'CONNECTED' ? `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.5rem;">
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-gold); padding: 1rem; border-radius: var(--radius-sm); text-align: center;">
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">Supabase Products</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: #fff;">${session.stats.products}</div>
      </div>
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-gold); padding: 1rem; border-radius: var(--radius-sm); text-align: center;">
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">Supabase Orders</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: #fff;">${session.stats.orders}</div>
      </div>
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-gold); padding: 1rem; border-radius: var(--radius-sm); text-align: center;">
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.3rem;">Supabase Coupons</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: #fff;">${session.stats.coupons}</div>
      </div>
    </div>
  ` : '';

  container.innerHTML = `
    <div style="max-width: 850px; display: flex; flex-direction: column; gap: 1.5rem; animation: fadeIn 0.3s ease;">
      
      <!-- Connection Settings Box -->
      <div style="background: var(--bg-card); border: 1.5px solid var(--border-gold); border-radius: var(--radius-md); padding: 2rem; box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
        <h3 style="color: var(--accent-gold); font-size: 1.2rem; margin-bottom: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 0.6rem;">
          <span>🔗</span> Supabase Live Connection Credentials
        </h3>
        
        <form id="supabase-config-form" style="display: flex; flex-direction: column; gap: 1.2rem;">
          <div class="form-group">
            <label class="form-label" style="color: var(--accent-gold); font-weight: 700;">Supabase API Project URL *</label>
            <input type="url" name="url" value="${state.supabaseConfig.url || ''}" required placeholder="https://your-project-id.supabase.co" class="form-input" style="border-color: var(--border-gold); padding: 0.7rem;" />
          </div>

          <div class="form-group">
            <label class="form-label" style="color: var(--accent-gold); font-weight: 700;">Supabase Public Anon Key *</label>
            <input type="password" name="anonKey" value="${state.supabaseConfig.anonKey || ''}" required placeholder="Paste public anon key" class="form-input" style="border-color: var(--border-gold); padding: 0.7rem;" />
          </div>

          <div class="form-group">
            <label class="form-label" style="color: var(--accent-gold); font-weight: 700;">Supabase Service Role Key (Admin Access) *</label>
            <input type="password" name="serviceRoleKey" value="${state.supabaseConfig.serviceRoleKey || ''}" required placeholder="Paste service_role key to bypass RLS security policies" class="form-input" style="border-color: var(--border-gold); padding: 0.7rem;" />
          </div>

          <div class="form-group">
            <label class="form-label" style="color: var(--accent-gold); font-weight: 700;">Database Schema / Name</label>
            <input type="text" name="dbName" value="${state.supabaseConfig.dbName || 'postgres'}" placeholder="postgres" class="form-input" style="border-color: var(--border-gold); padding: 0.7rem;" />
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; margin-top: 1.2rem; border-top: 1px dashed var(--border-light); padding-top: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;">
              <button type="submit" class="btn btn-primary" style="font-weight: 800; padding: 0.8rem 1.6rem;">
                🔌 Connect & Setup Database
              </button>
              ${session.status === 'CONNECTED' ? `
                <button type="button" id="btn-supabase-disconnect" class="btn btn-outline-gold" style="color: var(--accent-neon); border-color: rgba(230,57,70,0.5); padding: 0.8rem 1.6rem;">
                  📴 Disconnect Database
                </button>
              ` : ''}
            </div>

            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <strong style="font-size: 0.85rem; color: var(--text-secondary);">Real-Time Status:</strong>
              <div id="supabase-status-badge-root">${statusHtml}</div>
            </div>
          </div>
        </form>
      </div>

      <!-- Sync and Maintenance Box -->
      ${session.status === 'CONNECTED' ? `
        <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
          <h3 style="color: var(--accent-gold); font-size: 1.15rem; margin-bottom: 0.5rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚡</span> Remote Data Synchronization & Utilities
          </h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
            Migrate your storefront catalog data or check live storage stats.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;">
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: var(--radius-sm); display: flex; flex-direction: column; justify-content: space-between; border-left: 3px solid var(--accent-gold);">
              <div>
                <h4 style="color: #ffffff; font-size: 0.98rem; margin-bottom: 0.4rem; font-weight: 700;">Sync Local Storefront Data</h4>
                <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 1rem;">
                  Upserts all products, orders, coupons, payment accounts, and custom shipping rates currently saved in your local storage into Supabase tables.
                </p>
              </div>
              <button id="btn-supabase-sync-data" class="btn btn-primary" style="width: 100%; font-weight: 700; padding: 0.7rem;">
                ⬆️ Sync Local Storage to Supabase
              </button>
            </div>

            <div style="background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 1.2rem; border-radius: var(--radius-sm); display: flex; flex-direction: column; justify-content: space-between; border-left: 3px solid var(--accent-neon);">
              <div>
                <h4 style="color: #ffffff; font-size: 0.98rem; margin-bottom: 0.4rem; font-weight: 700;">Database SQL Schema</h4>
                <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 1rem;">
                  View the official SQL schema needed to initialize tables and enable realtime subscriptions inside your Supabase SQL Editor.
                </p>
              </div>
              <button id="btn-supabase-show-schema" class="btn btn-secondary" style="width: 100%; font-weight: 700; padding: 0.7rem;">
                👁️ View SQL DDL Commands
              </button>
            </div>
          </div>

          ${statsHtml}
        </div>
      ` : ''}

      <!-- SQL DDL Schema Modal -->
      <div id="supabase-schema-modal-overlay" class="modal-overlay" style="display: none; justify-content: center; align-items: center; z-index: 10050; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); position: fixed; top: 0; left: 0; width: 100%; height: 100%;">
        <div style="background: var(--bg-card); border: 1.5px solid var(--border-gold); border-radius: var(--radius-md); width: 90%; max-width: 700px; padding: 2rem; max-height: 85vh; overflow-y: auto;">
          <h3 style="color: var(--accent-gold); margin-bottom: 0.8rem; font-size: 1.2rem; font-weight: 800;">📋 Supabase SQL Schema DDL</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.2rem;">Copy and run this code inside your Supabase project SQL Editor to initialize all tables and enable realtime updates:</p>
          
          <pre style="background: #000; padding: 1.2rem; border-radius: 6px; border: 1px solid var(--border-gold); overflow-x: auto; font-family: monospace; font-size: 0.8rem; color: #00ff88; margin-bottom: 1.5rem; text-align: left; max-height: 40vh; overflow-y: auto;">
-- 1. Create Tables
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  category TEXT NOT NULL,
  color TEXT,
  "colorVariants" JSONB DEFAULT '[]'::jsonb,
  material TEXT,
  condition TEXT,
  price NUMERIC NOT NULL,
  "originalPrice" NUMERIC,
  "isFlashSale" BOOLEAN DEFAULT false,
  "discountPercent" NUMERIC,
  stock INTEGER NOT NULL DEFAULT 0,
  badge TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  "inStock" BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC DEFAULT 5.0,
  "reviewCount" INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  "trackingNo" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  courier TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "paymentProof" TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC NOT NULL DEFAULT 0,
  "shippingFee" NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Processing',
  timestamp BIGINT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  "discountPercent" NUMERIC NOT NULL DEFAULT 0,
  "minSpend" NUMERIC NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "freeShipping" BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS city_rates (
  city TEXT PRIMARY KEY,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_rates ENABLE ROW LEVEL SECURITY;

-- 3. Configure Policies for anonymous storefront
CREATE POLICY "Allow public read products" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read orders" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public read coupons" ON coupons FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read configs" ON configs FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read city_rates" ON city_rates FOR SELECT TO anon USING (true);

-- 4. Enable Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE coupons;
          </pre>

          <div style="text-align: right;">
            <button id="btn-close-schema-modal" class="btn btn-primary">Done</button>
          </div>
        </div>
      </div>

    </div>
  `;

  // Bind Form Submit
  const configForm = container.querySelector('#supabase-config-form');
  configForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(configForm);
    const config = {
      url: fd.get('url').trim(),
      anonKey: fd.get('anonKey').trim(),
      serviceRoleKey: fd.get('serviceRoleKey').trim(),
      dbName: fd.get('dbName').trim() || 'postgres'
    };

    appStore.showToast('Connecting to Supabase...', 'info');
    await appStore.saveSupabaseConfig(config);
    renderSupabaseManager(container, appStore.state);
  });

  // Bind Disconnect Button
  container.querySelector('#btn-supabase-disconnect')?.addEventListener('click', async () => {
    await appStore.disconnectSupabase();
    renderSupabaseManager(container, appStore.state);
  });

  // Bind Data Sync Button
  container.querySelector('#btn-supabase-sync-data')?.addEventListener('click', async () => {
    await appStore.syncLocalToSupabase();
    renderSupabaseManager(container, appStore.state);
  });

  // Bind Schema Modal open/close
  const schemaOverlay = container.querySelector('#supabase-schema-modal-overlay');
  container.querySelector('#btn-supabase-show-schema')?.addEventListener('click', () => {
    if (schemaOverlay) schemaOverlay.style.display = 'flex';
  });
  container.querySelector('#btn-close-schema-modal')?.addEventListener('click', () => {
    if (schemaOverlay) schemaOverlay.style.display = 'none';
  });
}
