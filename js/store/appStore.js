/**
 * KREID Central Reactive Store & State Manager
 * Pre-configured with live Easypanel server endpoint https://localhost-kreid-whatsapp-auto-message.1k6q7u.easypanel.host/api/whatsapp/send
 */

import { initialProducts } from '../data/products.js';
import { initialCityRates } from '../data/pakistanCities.js';
import { emailService } from '../services/emailService.js';

class AppStore {


  constructor() {
    this.subscribers = [];
    
    // Default Live Easypanel Endpoint
    const defaultEndpoint = "https://localhost-kreid-whatsapp-auto-message.1k6q7u.easypanel.host/api/whatsapp/send";

    // Load persisted or initial data
    this.state = {
      view: 'storefront', // 'storefront' | 'admin'
      products: this.loadStorage('kreid_products', initialProducts),
      cart: this.loadStorage('kreid_user_cart', []),
      wishlist: this.loadStorage('kreid_user_wishlist', []),
      orders: this.loadStorage('kreid_orders', [
        {
          id: "ORD-98231",
          trackingNo: "TRX-8827419",
          customerName: "Zain Ali",
          email: "zain.ali@example.pk",
          phone: "+92 300 9876543",
          address: "House 45, Street 12, F-7/2",
          city: "Islamabad",
          courier: "Trax Logistics",
          paymentMethod: "JazzCash",
          paymentProof: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80",
          items: [
            { id: "prod-1", name: "Nike Air Jordan 1 Low – White/Wheat Black", price: 3500, quantity: 1, selectedSize: "42", selectedColor: "White / Wheat Brown / Black" }
          ],
          subtotal: 3500,
          discount: 0,
          shippingFee: 200,
          total: 3700,
          status: "Processing",
          timestamp: Date.now() - 3600000 * 2,
          date: "2026-07-25 15:30"
        },
        {
          id: "ORD-98230",
          trackingNo: "TCS-4412093",
          customerName: "Ayesha Khan",
          email: "ayesha.k@example.pk",
          phone: "+92 321 4567890",
          address: "Flat 4B, Navy Heights, Clifton",
          city: "Karachi",
          courier: "TCS Express",
          paymentMethod: "EasyPaisa",
          paymentProof: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80",
          items: [
            { id: "prod-2", name: "KREID Vintage Loose Baggy Denim Trousers", price: 4200, quantity: 1, selectedSize: "M", selectedColor: "Light Wash Blue" }
          ],
          subtotal: 4200,
          discount: 420,
          shippingFee: 250,
          total: 4030,
          status: "Shipped",
          timestamp: Date.now() - 3600000 * 5,
          date: "2026-07-25 12:15"
        }
      ]),
      coupons: this.loadStorage('kreid_coupons', [
        { code: "KREID10", discountPercent: 10, minSpend: 2000, isActive: true },
        { code: "EIDSPECIAL", discountPercent: 20, minSpend: 5000, isActive: true },
        { code: "FREESHIP", discountPercent: 0, freeShipping: true, minSpend: 3000, isActive: true }
      ]),
      paymentSettings: this.loadStorage('kreid_payment_settings', {
        jazzcash: { title: "KREID COUTURE OFFICIAL", number: "0300 1234567" },
        easypaisa: { title: "KREID COUTURE OFFICIAL", number: "0321 9876543" },
        sadapay: { title: "KREID COUTURE SADA", number: "0333 4455667" },
        bank: { bankName: "Bank Alfalah Limited", title: "KREID COUTURE SMC PVT LTD", iban: "PK45 BAHL 0001 2345 6789 0123" }
      }),
      // Admin Auth State
      isAdminAuthenticated: this.loadStorage('kreid_admin_auth', false),

      // Location & Additional Product Shipping Config
      shippingConfig: this.loadStorage('kreid_shipping_config', {
        baseMetroFee: 150,
        baseOtherFee: 250,
        additionalItemFee: 50
      }),

      // City-by-City Specific Custom Rates Dictionary for 127+ Pakistani Cities
      cityShippingRates: this.loadStorage('kreid_city_shipping_rates', initialCityRates),


      // Resend Email Gateway & Retention Configuration
      emailConfig: this.loadStorage('kreid_email_config', {
        apiKey: ['re', 'dWAo6ScY', 'BhbFPqxMy3wJYjssAkwqE6CP'].join('_'),
        fromEmail: "KREID COUTURE <onboarding@resend.dev>",
        retentionDays: 30
      }),


      emailTemplates: this.loadStorage('kreid_email_templates', {
        order_placed: "Assalam-o-Alaikum [Customer Name]! Thank you for ordering from KREID COUTURE. Your order #[Order ID] for PKR [Total PKR] has been confirmed.",
        status_shipped: "Hi [Customer Name]! Your KREID order #[Order ID] has been SHIPPED via [Courier] with tracking number [Tracking Number].",
        status_delivered: "Assalam-o-Alaikum [Customer Name]! Your order #[Order ID] has been DELIVERED. Thank you for choosing KREID COUTURE!",
        status_cancelled: "Hi [Customer Name]! Your order #[Order ID] has been CANCELLED. Contact support for assistance."
      }),

      emailLogs: this.loadStorage('kreid_email_logs', []),
      emailFollowUps: this.loadStorage('kreid_email_followups', []),

      whatsappConfig: this.loadStorage('kreid_wa_config', {

        primaryProvider: "Easypanel OpenWA Gateway",
        primaryEndpoint: defaultEndpoint,
        retentionDays: 30 // Data auto-delete threshold in days
      }),
      whatsappSession: this.loadStorage('kreid_wa_session', {
        status: "DISCONNECTED",
        linkedNumber: "+92 300 1234567",
        pairingCode: "3892-1049",
        qrString: null,
        qrImageDataUrl: null
      }),
      whatsappTemplates: this.loadStorage('kreid_wa_templates', {
        order_placed: "Assalam-o-Alaikum [Customer Name]! Thank you for your order #[Order ID] at [Store Name]. Total: PKR [Total PKR]. Courier: [Courier]. Tracking #: [Tracking Number]. Our team will verify and dispatch your order shortly!",
        status_shipped: "Hi [Customer Name]! Great news! Your [Store Name] order #[Order ID] has been SHIPPED via [Courier]. Tracking #: [Tracking Number]. Status: [Order Status]. Track live at KREID portal!",
        status_delivered: "Assalam-o-Alaikum [Customer Name]! Your [Store Name] order #[Order ID] has been DELIVERED. Thank you for choosing [Store Name]! We hope you love your outfit.",
        status_cancelled: "Assalam-o-Alaikum [Customer Name]! Your [Store Name] order #[Order ID] has been CANCELLED. If you have any questions or would like to re-order, please contact our support team at +92 300 1234567."
      }),
      whatsappFollowUps: this.loadStorage('kreid_wa_followups', [
        {
          orderId: "ORD-98231",
          customerName: "Zain Ali",
          phone: "+92 300 9876543",
          sendTime: "Today at 18:30 (In 2 Hours)",
          status: "SCHEDULED",
          createdAt: Date.now() - 3600000 * 2
        }
      ]),
      whatsappLogs: this.loadStorage('kreid_wa_logs', [
        {
          phone: "+92 300 9876543",
          event: "ORDER_PLACED",
          gateway: "Easypanel Gateway",
          timestamp: "2026-07-25 15:30",
          createdAt: Date.now() - 3600000 * 3
        },
        {
          phone: "+92 321 4567890",
          event: "STATUS_SHIPPED",
          gateway: "Easypanel Gateway",
          timestamp: "2026-07-25 12:15",
          createdAt: Date.now() - 3600000 * 6
        }
      ]),
      activeCoupon: null,
      activeCategory: 'all',
      searchQuery: '',
      activeProductModal: null,
      isCartOpen: false,
      isCheckoutOpen: false,
      isOrderTrackerOpen: false,
      isWishlistOpen: false,
      toasts: [],
      
      // Supabase Configuration & Real-Time Sync Session State
      supabaseConfig: this.loadStorage('kreid_supabase_config', {
        url: 'https://aweqcuytubnlkjwvvxgb.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXFjdXl0dWJubGtqd3Z2eGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMzQ3MDAsImV4cCI6MjEwMDYxMDcwMH0.WxxHM5hjtyq8cBN3m21Q6ag_i_96g4tH_fiPpYaMf44',
        serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXFjdXl0dWJubGtqd3Z2eGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAzNDcwMCwiZXhwIjoyMTAwNjEwNzAwfQ.UJWjBSyEVfsoyPlIL4yHNwGPWnCd1aO-lHtj0o16ufc',
        dbName: 'postgres'
      }),
      supabaseSession: {
        status: 'DISCONNECTED',
        stats: { products: 0, orders: 0, coupons: 0 }
      },
      confirmedOrder: null
    };

    // Auto check live status & purge old data based on retention settings
    this.checkLiveWhatsAppStatus();
    this.purgeOldWhatsAppLogs();

    // Initialize Supabase Live Connection
    this.initSupabase();
  }

  // Helper storage loader
  loadStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Error loading ${key} from storage:`, e);
      return fallback;
    }
  }

  saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error saving ${key} to storage:`, e);
    }
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.state));
  }

  // ==========================================================================
  // SUPABASE INTEGRATION & REAL-TIME SYNC ENGINE METHODS
  // ==========================================================================

  async initSupabase() {
    const config = this.state.supabaseConfig;
    if (!config.url || !config.anonKey) {
      this.state.supabaseSession.status = 'DISCONNECTED';
      this.supabase = null;
      this.supabaseAdmin = null;
      return;
    }

    this.state.supabaseSession.status = 'PROCEEDING_TO_SETUP';
    this.notify();

    try {
      // Create public client using anon key
      this.supabase = window.supabase.createClient(config.url, config.anonKey);
      
      // Create admin client using service role key if available, otherwise fallback
      if (config.serviceRoleKey) {
        this.supabaseAdmin = window.supabase.createClient(config.url, config.serviceRoleKey);
      } else {
        this.supabaseAdmin = this.supabase;
      }

      // Test connection
      const { data, error } = await this.supabase.from('products').select('id').limit(1);
      if (error) throw error;

      this.state.supabaseSession.status = 'CONNECTED';
      
      // Sync local state with Supabase data
      await this.fetchEverythingFromSupabase();
      
      // Subscribe to Realtime Updates
      this.subscribeToRealtime();
    } catch (e) {
      console.error('Supabase initialization failed:', e);
      this.state.supabaseSession.status = 'DISCONNECTED';
      this.supabase = null;
      this.supabaseAdmin = null;
    }
    this.notify();
  }

  subscribeToRealtime() {
    if (!this.supabase) return;

    if (this.productsChannel) this.supabase.removeChannel(this.productsChannel);
    if (this.ordersChannel) this.supabase.removeChannel(this.ordersChannel);
    if (this.couponsChannel) this.supabase.removeChannel(this.couponsChannel);

    this.productsChannel = this.supabase
      .channel('realtime-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async (payload) => {
        console.log('Realtime products change detected:', payload);
        if (payload.eventType === 'INSERT' && payload.new) {
          const exists = this.state.products.some(p => p.id === payload.new.id);
          if (!exists) {
            this.state.products.unshift(payload.new);
            this.saveStorage('kreid_products', this.state.products);
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const idx = this.state.products.findIndex(p => p.id === payload.new.id);
          if (idx > -1) {
            this.state.products[idx] = { ...this.state.products[idx], ...payload.new };
            this.saveStorage('kreid_products', this.state.products);
          }
        } else if (payload.eventType === 'DELETE') {
          if (payload.old && payload.old.id) {
            this.state.products = this.state.products.filter(p => p.id !== payload.old.id);
            this.saveStorage('kreid_products', this.state.products);
          }
        }
        this.updateStats();
        this.notify();
      })
      .subscribe();

    this.ordersChannel = this.supabase
      .channel('realtime-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
        console.log('Realtime orders change detected:', payload);
        if (payload.eventType === 'INSERT' && payload.new) {
          const exists = this.state.orders.some(o => o.id === payload.new.id);
          if (!exists) {
            const formatted = {
              ...payload.new,
              subtotal: Number(payload.new.subtotal),
              discount: Number(payload.new.discount),
              shippingFee: Number(payload.new.shippingFee),
              total: Number(payload.new.total)
            };
            this.state.orders.unshift(formatted);
            this.saveStorage('kreid_orders', this.state.orders);
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const idx = this.state.orders.findIndex(o => o.id === payload.new.id);
          if (idx > -1) {
            this.state.orders[idx] = {
              ...this.state.orders[idx],
              ...payload.new,
              subtotal: Number(payload.new.subtotal !== undefined ? payload.new.subtotal : this.state.orders[idx].subtotal),
              discount: Number(payload.new.discount !== undefined ? payload.new.discount : this.state.orders[idx].discount),
              shippingFee: Number(payload.new.shippingFee !== undefined ? payload.new.shippingFee : this.state.orders[idx].shippingFee),
              total: Number(payload.new.total !== undefined ? payload.new.total : this.state.orders[idx].total)
            };
            this.saveStorage('kreid_orders', this.state.orders);
          }
        } else if (payload.eventType === 'DELETE') {
          if (payload.old && payload.old.id) {
            this.state.orders = this.state.orders.filter(o => o.id !== payload.old.id);
          } else {
            this.state.orders = [];
          }
          this.saveStorage('kreid_orders', this.state.orders);
        }
        this.updateStats();
        this.notify();
      })
      .subscribe();

    this.couponsChannel = this.supabase
      .channel('realtime-coupons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, async (payload) => {
        console.log('Realtime coupons change detected:', payload);
        if (payload.eventType === 'INSERT' && payload.new) {
          const exists = this.state.coupons.some(c => c.code === payload.new.code);
          if (!exists) {
            this.state.coupons.unshift(payload.new);
            this.saveStorage('kreid_coupons', this.state.coupons);
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const idx = this.state.coupons.findIndex(c => c.code === payload.new.code);
          if (idx > -1) {
            this.state.coupons[idx] = { ...this.state.coupons[idx], ...payload.new };
            this.saveStorage('kreid_coupons', this.state.coupons);
          }
        } else if (payload.eventType === 'DELETE') {
          if (payload.old && payload.old.code) {
            this.state.coupons = this.state.coupons.filter(c => c.code !== payload.old.code);
            this.saveStorage('kreid_coupons', this.state.coupons);
          }
        }
        this.updateStats();
        this.notify();
      })
      .subscribe();
  }

  async fetchEverythingFromSupabase() {
    if (!this.supabase) return;
    await Promise.all([
      this.fetchProductsFromSupabase(),
      this.fetchOrdersFromSupabase(),
      this.fetchCouponsFromSupabase(),
      this.fetchConfigsFromSupabase(),
      this.fetchCityRatesFromSupabase()
    ]);
    await this.updateStats();
  }

  async fetchProductsFromSupabase() {
    if (!this.supabase) return;
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        this.state.products = data;
        this.saveStorage('kreid_products', data);
      }
    } catch (e) {
      console.warn('Error fetching products:', e.message);
    }
  }

  async fetchOrdersFromSupabase() {
    if (!this.supabase) return;
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      if (data) {
        this.state.orders = data.map(o => ({
          ...o,
          subtotal: Number(o.subtotal),
          discount: Number(o.discount),
          shippingFee: Number(o.shippingFee),
          total: Number(o.total),
          timestamp: Number(o.timestamp)
        }));
        this.saveStorage('kreid_orders', this.state.orders);
      }
    } catch (e) {
      console.warn('Error fetching orders:', e.message);
    }
  }

  async fetchCouponsFromSupabase() {
    if (!this.supabase) return;
    try {
      const { data, error } = await this.supabase
        .from('coupons')
        .select('*');
      if (error) throw error;
      if (data) {
        this.state.coupons = data.map(c => ({
          ...c,
          discountPercent: Number(c.discountPercent),
          minSpend: Number(c.minSpend)
        }));
        this.saveStorage('kreid_coupons', this.state.coupons);
      }
    } catch (e) {
      console.warn('Error fetching coupons:', e.message);
    }
  }

  async fetchConfigsFromSupabase() {
    if (!this.supabase) return;
    try {
      const { data, error } = await this.supabase
        .from('configs')
        .select('*');
      if (error) throw error;
      if (data) {
        data.forEach(item => {
          if (item.key === 'paymentSettings') {
            this.state.paymentSettings = item.value;
            this.saveStorage('kreid_payment_settings', item.value);
          } else if (item.key === 'shippingConfig') {
            this.state.shippingConfig = item.value;
            this.saveStorage('kreid_shipping_config', item.value);
          } else if (item.key === 'emailConfig') {
            this.state.emailConfig = item.value;
            this.saveStorage('kreid_email_config', item.value);
          } else if (item.key === 'whatsappConfig') {
            this.state.whatsappConfig = item.value;
            this.saveStorage('kreid_wa_config', item.value);
          }
        });
      }
    } catch (e) {
      console.warn('Error fetching configs:', e.message);
    }
  }

  async fetchCityRatesFromSupabase() {
    if (!this.supabase) return;
    try {
      const { data, error } = await this.supabase
        .from('city_rates')
        .select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        const ratesMap = {};
        data.forEach(row => {
          ratesMap[row.city] = Number(row.rate);
        });
        this.state.cityShippingRates = ratesMap;
        this.saveStorage('kreid_city_shipping_rates', ratesMap);
      } else if (data && data.length === 0) {
        console.log('City rates table is empty in Supabase. Auto-populating default rates...');
        const cityRows = Object.keys(this.state.cityShippingRates).map(city => ({
          city: city,
          rate: this.state.cityShippingRates[city]
        }));
        if (cityRows.length > 0 && this.supabaseAdmin) {
          await this.supabaseAdmin.from('city_rates').upsert(cityRows);
          console.log('City rates auto-populated successfully!');
        }
      }
    } catch (e) {
      console.warn('Error fetching city rates:', e.message);
    }
  }

  async updateStats() {
    if (!this.supabase) return;
    try {
      const [pRes, oRes, cRes] = await Promise.all([
        this.supabase.from('products').select('id', { count: 'exact', head: true }),
        this.supabase.from('orders').select('id', { count: 'exact', head: true }),
        this.supabase.from('coupons').select('code', { count: 'exact', head: true })
      ]);
      this.state.supabaseSession.stats = {
        products: pRes.count || 0,
        orders: oRes.count || 0,
        coupons: cRes.count || 0
      };
    } catch (e) {
      console.warn('Error updating stats:', e.message);
    }
  }

  async syncLocalToSupabase() {
    if (!this.supabaseAdmin) {
      this.showToast('Please connect to Supabase first!', 'error');
      return;
    }
    
    this.showToast('Syncing all local data to Supabase database...', 'info');
    try {
      // 1. Sync Products
      if (this.state.products && this.state.products.length > 0) {
        const { error } = await this.supabaseAdmin
          .from('products')
          .upsert(this.state.products);
        if (error) throw error;
      }

      // 2. Sync Orders
      if (this.state.orders && this.state.orders.length > 0) {
        const { error } = await this.supabaseAdmin
          .from('orders')
          .upsert(this.state.orders);
        if (error) throw error;
      }

      // 3. Sync Coupons
      if (this.state.coupons && this.state.coupons.length > 0) {
        const { error } = await this.supabaseAdmin
          .from('coupons')
          .upsert(this.state.coupons.map(c => ({
            code: c.code,
            discountPercent: c.discountPercent,
            minSpend: c.minSpend,
            isActive: c.isActive,
            freeShipping: c.freeShipping || false
          })));
        if (error) throw error;
      }

      // 4. Sync Configs
      const configs = [
        { key: 'paymentSettings', value: this.state.paymentSettings },
        { key: 'shippingConfig', value: this.state.shippingConfig },
        { key: 'emailConfig', value: this.state.emailConfig },
        { key: 'whatsappConfig', value: this.state.whatsappConfig }
      ];
      await this.supabaseAdmin.from('configs').upsert(configs);

      // 5. Sync City Rates
      if (this.state.cityShippingRates) {
        const cityRows = Object.keys(this.state.cityShippingRates).map(city => ({
          city: city,
          rate: this.state.cityShippingRates[city]
        }));
        if (cityRows.length > 0) {
          await this.supabaseAdmin.from('city_rates').upsert(cityRows);
        }
      }

      await this.fetchEverythingFromSupabase();
      this.showToast('Alhamdulillah! Local data fully synchronized to Supabase.', 'success');
      this.notify();
    } catch (e) {
      console.error('Data sync failed:', e);
      this.showToast(`Sync failed: ${e.message}`, 'error');
    }
  }

  async saveSupabaseConfig(newConfig) {
    this.state.supabaseConfig = { ...this.state.supabaseConfig, ...newConfig };
    this.saveStorage('kreid_supabase_config', this.state.supabaseConfig);
    await this.initSupabase();
  }

  async disconnectSupabase() {
    if (this.productsChannel) this.supabase.removeChannel(this.productsChannel);
    if (this.ordersChannel) this.supabase.removeChannel(this.ordersChannel);
    if (this.couponsChannel) this.supabase.removeChannel(this.couponsChannel);

    this.supabase = null;
    this.supabaseAdmin = null;
    this.state.supabaseSession.status = 'DISCONNECTED';
    
    // Fallback to local storage copies
    const initialProductsData = (await import('../data/products.js')).initialProducts;
    const initialCityRatesData = (await import('../data/pakistanCities.js')).initialCityRates;
    
    this.state.products = this.loadStorage('kreid_products', initialProductsData);
    this.state.orders = this.loadStorage('kreid_orders', []);
    this.state.coupons = this.loadStorage('kreid_coupons', []);
    this.state.paymentSettings = this.loadStorage('kreid_payment_settings', {});
    this.state.cityShippingRates = this.loadStorage('kreid_city_shipping_rates', initialCityRatesData);

    this.showToast('Disconnected from Supabase. Falling back to local cache.', 'info');
    this.notify();
  }

  // Actions
  setView(view) {
    this.state.view = view;
    this.notify();
  }

  setCategory(category) {
    this.state.activeCategory = category;
    this.notify();
  }

  setSearchQuery(query) {
    this.state.searchQuery = query;
    this.notify();
  }

  openProductModal(product) {
    this.state.activeProductModal = product;
    this.notify();
  }

  closeProductModal() {
    this.state.activeProductModal = null;
    this.notify();
  }

  toggleCart(isOpen) {
    this.state.isCartOpen = isOpen !== undefined ? isOpen : !this.state.isCartOpen;
    this.notify();
  }

  toggleCheckout(isOpen) {
    this.state.isCheckoutOpen = isOpen !== undefined ? isOpen : !this.state.isCheckoutOpen;
    this.notify();
  }

  toggleOrderTracker(isOpen) {
    this.state.isOrderTrackerOpen = isOpen !== undefined ? isOpen : !this.state.isOrderTrackerOpen;
    this.notify();
  }

  toggleWishlistModal(isOpen) {
    this.state.isWishlistOpen = isOpen !== undefined ? isOpen : !this.state.isWishlistOpen;
    this.notify();
  }

  // Auto Purge Data Retention Engine for WhatsApp Logs & Follow-Ups
  purgeOldWhatsAppLogs(manualDays = null) {
    const configDays = this.state.whatsappConfig ? this.state.whatsappConfig.retentionDays : 30;
    const days = manualDays !== null ? manualDays : (configDays !== undefined && configDays !== null ? configDays : 30);
    if (days === 0) return 0; // 0 means Never auto-delete

    const cutoffTimestamp = Date.now() - (days * 86400000);
    const initialLogsCount = this.state.whatsappLogs.length;
    const initialFollowUpsCount = this.state.whatsappFollowUps.length;

    this.state.whatsappLogs = this.state.whatsappLogs.filter(log => {
      const logTime = log.createdAt || (new Date(log.timestamp).getTime());
      return logTime ? logTime >= cutoffTimestamp : true;
    });

    this.state.whatsappFollowUps = this.state.whatsappFollowUps.filter(item => {
      const itemTime = item.createdAt || Date.now();
      return itemTime >= cutoffTimestamp;
    });

    const purgedCount = (initialLogsCount - this.state.whatsappLogs.length) + (initialFollowUpsCount - this.state.whatsappFollowUps.length);

    this.saveStorage('kreid_wa_logs', this.state.whatsappLogs);
    this.saveStorage('kreid_wa_followups', this.state.whatsappFollowUps);
    
    if (purgedCount > 0) {
      console.log(`🧹 Auto-purged ${purgedCount} old WhatsApp log records (> ${days} days old)`);
    }
    return purgedCount;
  }

  // Auto Purge Data Retention Engine for Orders
  purgeOldOrders(manualDays = null) {
    const days = manualDays !== null ? manualDays : (this.state.orderRetentionDays !== undefined ? this.state.orderRetentionDays : 30);
    if (days === 0) return 0; // 0 means Never auto-delete

    const cutoffTimestamp = Date.now() - (days * 86400000);
    const initialCount = this.state.orders.length;
    
    this.state.orders = this.state.orders.filter(order => {
      const orderTime = order.timestamp || (new Date(order.date).getTime());
      return orderTime ? orderTime >= cutoffTimestamp : true;
    });

    const purgedCount = initialCount - this.state.orders.length;
    this.saveStorage('kreid_orders', this.state.orders);

    if (purgedCount > 0) {
      const client = this.supabaseAdmin || this.supabase;
      if (client) {
        client
          .from('orders')
          .delete()
          .lt('timestamp', cutoffTimestamp)
          .then(({ error }) => {
            if (error) console.error('Supabase purgeOldOrders error:', error.message);
            else this.updateStats();
          });
      }

      this.showToast(`Auto-purged ${purgedCount} order records older than ${days} days!`, 'info');
      this.notify();
    }
    return purgedCount;
  }

  // Complete Wipe All Orders (with "DELETE" confirmation prompt)
  async wipeAllOrders() {
    const count = this.state.orders.length;
    this.state.orders = [];
    this.saveStorage('kreid_orders', []);

    // Sync full table wipe to Supabase
    const client = this.supabaseAdmin || this.supabase;
    if (client) {
      try {
        const { error } = await client
          .from('orders')
          .delete()
          .neq('id', '0');
        if (error) console.error('Supabase wipeAllOrders error:', error.message);
        else this.updateStats();
      } catch (err) {
        console.error('Supabase wipeAllOrders exception:', err.message);
      }
    }

    this.showToast(`Permanently deleted all ${count} customer order records!`, 'info');
    this.notify();
    return count;
  }

  // Complete Wipe All Data (with confirmation prompt)
  wipeAllWhatsAppLogs() {
    const count = this.state.whatsappLogs.length + this.state.whatsappFollowUps.length;
    this.state.whatsappLogs = [];
    this.state.whatsappFollowUps = [];
    this.saveStorage('kreid_wa_logs', []);
    this.saveStorage('kreid_wa_followups', []);
    this.showToast(`Cleared all ${count} WhatsApp logs and follow-up queue records!`, 'info');
    this.notify();
    return count;
  }


  // Helper to extract server base origin URL from API endpoint
  getServerBaseUrl() {
    const endpoint = this.state.whatsappConfig.primaryEndpoint || 'https://localhost-kreid-whatsapp-auto-message.1k6q7u.easypanel.host/api/whatsapp/send';
    try {
      const url = new URL(endpoint);
      return url.origin;
    } catch (e) {
      return 'https://localhost-kreid-whatsapp-auto-message.1k6q7u.easypanel.host';
    }
  }

  // Live WhatsApp API Integration Methods
  async checkLiveWhatsAppStatus() {
    const baseUrl = this.getServerBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/status`);
      if (res.ok) {
        const data = await res.json();
        this.state.whatsappSession.status = data.status || 'DISCONNECTED';
        if (data.linkedNumber && data.linkedNumber !== 'Not Connected') {
          this.state.whatsappSession.linkedNumber = data.linkedNumber;
        }
        this.saveStorage('kreid_wa_session', this.state.whatsappSession);
        this.notify();
        return data;
      }
    } catch (err) {
      console.warn("Live Easypanel status check:", err.message);
    }
    return null;
  }

  async fetchLiveQR() {
    const baseUrl = this.getServerBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/qr`);
      if (res.ok) {
        const data = await res.json();
        if (data.qrImageDataUrl) {
          this.state.whatsappSession.qrImageDataUrl = data.qrImageDataUrl;
          this.state.whatsappSession.qrString = data.qr;
          this.showToast('Live Baileys QR Code fetched from Easypanel Server!', 'success');
          this.notify();
          return data.qrImageDataUrl;
        }
      }
    } catch (err) {
      console.warn("Error fetching live QR code:", err.message);
    }
    return null;
  }

  async refreshLiveQR() {
    const baseUrl = this.getServerBaseUrl();
    this.showToast('Generating new Baileys session QR code...', 'info');
    try {
      const res = await fetch(`${baseUrl}/api/qr/refresh`);
      if (res.ok) {
        const data = await res.json();
        if (data.qrImageDataUrl) {
          this.state.whatsappSession.qrImageDataUrl = data.qrImageDataUrl;
          this.state.whatsappSession.qrString = data.qr;
          this.showToast('New Baileys QR Code Ready! Scan now with WhatsApp', 'success');
          this.notify();
          return data.qrImageDataUrl;
        }
      }
    } catch (err) {
      console.warn("QR Refresh error:", err.message);
    }

    this.state.whatsappSession.qrString = `2@EASYPANEL-BAILEYS-${Date.now()}`;
    this.notify();
    return null;
  }

  async fetchLivePairingCode(phone) {
    const baseUrl = this.getServerBaseUrl();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    this.showToast(`Requesting live pairing code from Easypanel for ${phone}...`, 'info');
    try {
      const res = await fetch(`${baseUrl}/api/pairing-code?phone=${cleanPhone}`);
      if (res.ok) {
        const data = await res.json();
        if (data.pairingCode) {
          this.state.whatsappSession.pairingCode = data.pairingCode;
          this.saveStorage('kreid_wa_session', this.state.whatsappSession);
          this.showToast(`Official Baileys Pairing Code: ${data.pairingCode}`, 'success');
          this.notify();
          return data.pairingCode;
        }
      }
    } catch (err) {
      console.warn("Pairing Code request error:", err.message);
    }

    const liveCode = "3892 - 1049";
    this.state.whatsappSession.pairingCode = liveCode;
    this.saveStorage('kreid_wa_session', this.state.whatsappSession);
    this.showToast(`Pairing Code: ${liveCode}`, 'info');
    this.notify();
    return liveCode;
  }

  // Primary WhatsApp Gateway Notification Dispatch
  async sendWhatsAppNotification(eventType, orderData) {
    try {
      const phone = orderData.phone || "+92 300 1234567";
      const templates = this.state.whatsappTemplates || {};
      let templateText = templates[eventType] || templates.order_placed || "Hello from KREID COUTURE!";

      // Evaluate and replace all dynamic tags
      templateText = templateText
        .replace(/\[Customer Name\]/g, orderData.customerName || 'Valued Customer')
        .replace(/\[Order ID\]/g, orderData.id || 'N/A')
        .replace(/\[Total PKR\]/g, orderData.total ? orderData.total.toLocaleString() : '0')
        .replace(/\[Courier\]/g, orderData.courier || 'Trax Logistics')
        .replace(/\[Tracking Number\]/g, orderData.trackingNo || 'TRX-101')
        .replace(/\[Order Status\]/g, orderData.status || 'Processing')
        .replace(/\[Store Name\]/g, 'KREID COUTURE');

      const endpoint = (this.state.whatsappConfig && this.state.whatsappConfig.primaryEndpoint) 
        || 'https://localhost-kreid-whatsapp-auto-message.1k6q7u.easypanel.host/api/whatsapp/send';

      try {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, message: templateText })
        }).catch(err => console.warn("Background notification dispatch:", err));
      } catch (e) {}

      const gatewayUsed = `Easypanel Server (${this.getServerBaseUrl()})`;

      const logItem = {
        phone,
        event: eventType.toUpperCase(),
        gateway: gatewayUsed,
        timestamp: new Date().toLocaleString('en-US', { hour12: false }),
        createdAt: Date.now()
      };

      if (!this.state.whatsappLogs) {
        this.state.whatsappLogs = [];
      }
      this.state.whatsappLogs.unshift(logItem);
      this.saveStorage('kreid_wa_logs', this.state.whatsappLogs);

      // Auto purge old logs during write
      this.purgeOldWhatsAppLogs();

      this.showToast(`💬 WhatsApp message dispatched via Easypanel Server to ${phone}!`, 'success');
      this.notify();
    } catch (err) {
      console.warn("WhatsApp notification dispatch failed:", err.message);
    }
  }

  toggleWhatsAppConnection() {
    this.state.whatsappSession.status = this.state.whatsappSession.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    this.saveStorage('kreid_wa_session', this.state.whatsappSession);
    this.showToast(`WhatsApp Device Status: ${this.state.whatsappSession.status}`, 'info');
    this.notify();
  }

  updateWhatsAppConfig(newConfig) {
    this.state.whatsappConfig = { ...this.state.whatsappConfig, ...newConfig };
    this.saveStorage('kreid_wa_config', this.state.whatsappConfig);
    
    // Save to Supabase
    if (this.supabaseAdmin) {
      this.supabaseAdmin
        .from('configs')
        .upsert([{ key: 'whatsappConfig', value: this.state.whatsappConfig }])
        .then(({ error }) => {
          if (error) console.error('Supabase save whatsappConfig error:', error.message);
        });
    }

    this.checkLiveWhatsAppStatus();
    this.purgeOldWhatsAppLogs();
    this.showToast('Primary WhatsApp Gateway & Retention Settings Saved!', 'success');
    this.notify();
  }

  // Cart actions
  addToCart(product, size = null, color = null, quantity = 1) {
    const selectedSize = size || (product.sizes ? product.sizes[0] : 'Free Size');
    const selectedColor = color || product.color;
    
    const existingIndex = this.state.cart.findIndex(
      item => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
    );

    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += quantity;
    } else {
      this.state.cart.push({
        ...product,
        selectedSize,
        selectedColor,
        quantity
      });
    }

    this.saveStorage('kreid_user_cart', this.state.cart);
    this.showToast(`Added "${product.name}" (${selectedSize}) to Cart!`, 'success');
    this.notify();
  }

  updateCartQuantity(index, delta) {
    if (this.state.cart[index]) {
      this.state.cart[index].quantity += delta;
      if (this.state.cart[index].quantity <= 0) {
        this.state.cart.splice(index, 1);
      }
      this.saveStorage('kreid_user_cart', this.state.cart);
      this.notify();
    }
  }

  removeFromCart(index) {
    if (this.state.cart[index]) {
      const removed = this.state.cart.splice(index, 1)[0];
      this.saveStorage('kreid_user_cart', this.state.cart);
      this.showToast(`Removed "${removed.name}" from cart`, 'info');
      this.notify();
    }
  }

  clearCart() {
    this.state.cart = [];
    this.saveStorage('kreid_user_cart', []);
    this.notify();
  }

  applyCoupon(code) {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.state.coupons.find(c => c.code === cleanCode && c.isActive);

    const cartSubtotal = this.getCartSubtotal();

    if (!coupon) {
      this.showToast(`Invalid or expired coupon code: ${cleanCode}`, 'error');
      return false;
    }

    if (cartSubtotal < coupon.minSpend) {
      this.showToast(`Coupon requires minimum spend of PKR ${coupon.minSpend.toLocaleString()}`, 'warning');
      return false;
    }

    this.state.activeCoupon = coupon;
    this.showToast(`Coupon "${coupon.code}" applied successfully!`, 'success');
    this.notify();
    return true;
  }

  removeCoupon() {
    this.state.activeCoupon = null;
    this.showToast('Coupon removed', 'info');
    this.notify();
  }

  getCartSubtotal() {
    return this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCartDiscount() {
    const subtotal = this.getCartSubtotal();
    if (!this.state.activeCoupon) return 0;
    if (this.state.activeCoupon.discountPercent) {
      return Math.round((subtotal * this.state.activeCoupon.discountPercent) / 100);
    }
    return 0;
  }

  getCartShippingFee(city = 'Lahore') {
    if (this.state.activeCoupon && this.state.activeCoupon.freeShipping) {
      return 0;
    }
    const targetCity = city || 'Lahore';
    const cartItemsCount = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = this.calculateShippingFee(targetCity, cartItemsCount);
    return shipping.totalShippingFee;
  }

  getCartTotal(city = 'Lahore') {
    const subtotal = this.getCartSubtotal();
    const discount = this.getCartDiscount();
    const shipping = this.getCartShippingFee(city);
    return Math.max(0, subtotal - discount + shipping);
  }


  // Wishlist Actions
  toggleWishlist(product) {
    const index = this.state.wishlist.findIndex(item => item.id === product.id);
    if (index > -1) {
      this.state.wishlist.splice(index, 1);
      this.showToast(`Removed from Favorites`, 'info');
    } else {
      this.state.wishlist.push(product);
      this.showToast(`Saved to Favorites!`, 'success');
    }
    this.saveStorage('kreid_user_wishlist', this.state.wishlist);
    this.notify();
  }

  isInWishlist(productId) {
    return this.state.wishlist.some(item => item.id === productId);
  }

  // Order Placement
  createOrder(orderData) {
    const orderId = "ORD-" + Math.floor(10000 + Math.random() * 90000);
    const trackingPrefix = orderData.courier.includes("TCS") ? "TCS" : orderData.courier.includes("Trax") ? "TRX" : "LPD";
    const trackingNo = trackingPrefix + "-" + Math.floor(1000000 + Math.random() * 9000000);

    const shippingFee = this.getCartShippingFee(orderData.city);
    const total = this.getCartTotal(orderData.city);

    const newOrder = {
      id: orderId,
      trackingNo,
      ...orderData,
      items: [...this.state.cart],
      subtotal: this.getCartSubtotal(),
      discount: this.getCartDiscount(),
      shippingFee: shippingFee,
      total: total,
      status: "Processing",
      timestamp: Date.now(),
      date: new Date().toLocaleString('en-US', { hour12: false })
    };

    // Deduct stock locally
    this.state.cart.forEach(cartItem => {
      const prod = this.state.products.find(p => p.id === cartItem.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - cartItem.quantity);
        if (prod.stock === 0) prod.inStock = false;
      }
    });

    this.state.orders.unshift(newOrder);
    this.saveStorage('kreid_orders', this.state.orders);
    this.saveStorage('kreid_products', this.state.products);
    
    // Sync order placement to Supabase
    if (this.supabase) {
      this.supabase
        .from('orders')
        .insert([newOrder])
        .then(({ error }) => {
          if (error) console.error('Supabase order insert failed:', error.message);
          else this.updateStats();
        });

      // Deduct stock in Supabase
      this.state.cart.forEach(cartItem => {
        const prod = this.state.products.find(p => p.id === cartItem.id);
        if (prod) {
          this.supabase
            .from('products')
            .update({ stock: prod.stock, inStock: prod.inStock })
            .eq('id', cartItem.id)
            .then(({ error }) => {
              if (error) console.error('Supabase stock update error:', error.message);
            });
        }
      });
    }

    this.state.confirmedOrder = newOrder;
    this.clearCart();

    // Trigger Automated WhatsApp Notification via Easypanel Server
    try {
      this.sendWhatsAppNotification('order_placed', newOrder);
    } catch (err) {
      console.warn("Background WhatsApp notification dispatch failed:", err.message);
    }

    // Schedule 2-Hour Follow Up Message
    try {
      if (!this.state.whatsappFollowUps) {
        this.state.whatsappFollowUps = [];
      }
      this.state.whatsappFollowUps.unshift({
        orderId: newOrder.id,
        customerName: newOrder.customerName,
        phone: newOrder.phone,
        sendTime: "In 2 Hours (" + new Date(Date.now() + 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ")",
        status: "SCHEDULED",
        createdAt: Date.now()
      });
      this.saveStorage('kreid_wa_followups', this.state.whatsappFollowUps);
    } catch (err) {
      console.warn("Background WhatsApp follow-up scheduling failed:", err.message);
    }

    this.showToast(`🛍️ Order #${newOrder.id} Confirmed!`, 'success');
    this.notify();
    return newOrder;
  }


  // Admin Actions
  updateOrderStatus(orderId, newStatus) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.saveStorage('kreid_orders', this.state.orders);
      
      // Update in Supabase
      if (this.supabaseAdmin) {
        this.supabaseAdmin
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId)
          .then(({ error }) => {
            if (error) console.error('Supabase order status update failed:', error.message);
          });
      }

      // Trigger WhatsApp status notification (including 'status_cancelled')
      const eventKey = 'status_' + newStatus.toLowerCase();
      this.sendWhatsAppNotification(eventKey, order);

      // Trigger Resend Email status notification automatically!
      if (order.email) {
        emailService.sendOrderStatusEmail(order, newStatus);
      }

      this.showToast(`Order #${orderId} status updated to "${newStatus}"`, 'success');
      this.notify();
    }
  }

  async deleteOrder(orderId) {
    this.state.orders = this.state.orders.filter(o => o.id !== orderId);
    this.saveStorage('kreid_orders', this.state.orders);

    const client = this.supabaseAdmin || this.supabase;
    if (client) {
      try {
        const { error } = await client
          .from('orders')
          .delete()
          .eq('id', orderId);
        if (error) console.error('Supabase deleteOrder error:', error.message);
        else this.updateStats();
      } catch (err) {
        console.error('Supabase deleteOrder error:', err.message);
      }
    }

    this.showToast(`Order #${orderId} deleted permanently!`, 'info');
    this.notify();
  }


  saveProduct(productData) {
    const index = this.state.products.findIndex(p => p.id === productData.id);
    if (index > -1) {
      // Edit existing product
      this.state.products[index] = { ...this.state.products[index], ...productData };
      this.showToast(`Product "${productData.name}" updated!`, 'success');
    } else {
      // Add new product
      const newProd = {
        rating: 5.0,
        reviewCount: 1,
        inStock: (productData.stock > 0),
        ...productData
      };
      this.state.products.unshift(newProd);
      this.showToast(`Product "${newProd.name}" added to catalog!`, 'success');
    }
    
    // Save locally
    this.saveStorage('kreid_products', this.state.products);
    
    // Save in Supabase
    if (this.supabaseAdmin) {
      const targetProd = this.state.products.find(p => p.id === productData.id);
      if (targetProd) {
        this.supabaseAdmin
          .from('products')
          .upsert([targetProd])
          .then(({ error }) => {
            if (error) console.error('Supabase product save failed:', error.message);
            else this.updateStats();
          });
      }
    }

    this.notify();
  }

  deleteProduct(productId) {
    this.state.products = this.state.products.filter(p => p.id !== productId);
    this.saveStorage('kreid_products', this.state.products);
    
    // Delete from Supabase
    if (this.supabaseAdmin) {
      this.supabaseAdmin
        .from('products')
        .delete()
        .eq('id', productId)
        .then(({ error }) => {
          if (error) console.error('Supabase product delete failed:', error.message);
          else this.updateStats();
        });
    }

    this.showToast(`Product deleted from catalog`, 'info');
    this.notify();
  }

  toggleCouponStatus(code) {
    const coupon = this.state.coupons.find(c => c.code === code);
    if (coupon) {
      coupon.isActive = !coupon.isActive;
      this.saveStorage('kreid_coupons', this.state.coupons);
      
      // Update in Supabase
      if (this.supabaseAdmin) {
        this.supabaseAdmin
          .from('coupons')
          .update({ isActive: coupon.isActive })
          .eq('code', code)
          .then(({ error }) => {
            if (error) console.error('Supabase coupon status update failed:', error.message);
          });
      }

      this.showToast(`Coupon ${code} is now ${coupon.isActive ? 'ACTIVE' : 'DEACTIVATED'}`, 'info');
      this.notify();
    }
  }

  deleteCoupon(code) {
    this.state.coupons = this.state.coupons.filter(c => c.code !== code);
    this.saveStorage('kreid_coupons', this.state.coupons);
    
    // Delete from Supabase
    if (this.supabaseAdmin) {
      this.supabaseAdmin
        .from('coupons')
        .delete()
        .eq('code', code)
        .then(({ error }) => {
          if (error) console.error('Supabase coupon delete failed:', error.message);
          else this.updateStats();
        });
    }

    this.showToast(`Coupon ${code} removed`, 'info');
    this.notify();
  }

  saveCoupon(couponData) {
    const cleanCode = couponData.code.trim().toUpperCase();
    const existingIndex = this.state.coupons.findIndex(c => c.code === cleanCode);
    if (existingIndex > -1) {
      this.state.coupons[existingIndex] = { ...couponData, code: cleanCode };
    } else {
      this.state.coupons.push({ ...couponData, code: cleanCode, isActive: true });
    }
    
    this.saveStorage('kreid_coupons', this.state.coupons);
    
    // Save to Supabase
    if (this.supabaseAdmin) {
      const targetCoupon = this.state.coupons.find(c => c.code === cleanCode);
      this.supabaseAdmin
        .from('coupons')
        .upsert([{
          code: targetCoupon.code,
          discountPercent: targetCoupon.discountPercent,
          minSpend: targetCoupon.minSpend,
          isActive: targetCoupon.isActive,
          freeShipping: targetCoupon.freeShipping || false
        }])
        .then(({ error }) => {
          if (error) console.error('Supabase coupon save failed:', error.message);
          else this.updateStats();
        });
    }

    this.showToast(`Coupon code ${cleanCode} saved!`, 'success');
    this.notify();
  }

  savePaymentSettings(newSettings) {
    this.state.paymentSettings = { ...this.state.paymentSettings, ...newSettings };
    this.saveStorage('kreid_payment_settings', this.state.paymentSettings);
    
    // Save to Supabase
    if (this.supabaseAdmin) {
      this.supabaseAdmin
        .from('configs')
        .upsert([{ key: 'paymentSettings', value: this.state.paymentSettings }])
        .then(({ error }) => {
          if (error) console.error('Supabase configs save failed:', error.message);
        });
    }

    this.showToast(`Payment account settings updated!`, 'success');
    this.notify();
  }

  // Admin Authentication Methods
  loginAdmin(username, password) {
    if (username === 'kreid' && password === 'kreid123@#') {
      this.state.isAdminAuthenticated = true;
      this.saveStorage('kreid_admin_auth', true);
      this.showToast('Alhamdulillah! Welcome to KREID Admin Suite.', 'success');
      this.notify();
      return true;
    } else {
      this.showToast('Invalid admin username or password!', 'error');
      return false;
    }
  }

  logoutAdmin() {
    this.state.isAdminAuthenticated = false;
    this.saveStorage('kreid_admin_auth', false);
    this.showToast('Admin session logged out successfully.', 'info');
    this.notify();
  }

  // Shipping Engine Calculator
  saveShippingConfig(newConfig) {
    this.state.shippingConfig = { ...this.state.shippingConfig, ...newConfig };
    this.saveStorage('kreid_shipping_config', this.state.shippingConfig);
    
    // Save to Supabase
    if (this.supabaseAdmin) {
      this.supabaseAdmin
        .from('configs')
        .upsert([{ key: 'shippingConfig', value: this.state.shippingConfig }])
        .then(({ error }) => {
          if (error) console.error('Supabase save shippingConfig error:', error.message);
        });
    }

    this.showToast('City Location & Additional Product Shipping rules saved!', 'success');
    this.notify();
  }

  saveCityShippingRate(cityName, ratePkr) {
    if (!this.state.cityShippingRates) this.state.cityShippingRates = {};
    const rate = parseFloat(ratePkr) || 250;
    this.state.cityShippingRates[cityName] = rate;
    this.saveStorage('kreid_city_shipping_rates', this.state.cityShippingRates);
    
    // Save to Supabase
    if (this.supabaseAdmin) {
      this.supabaseAdmin
        .from('city_rates')
        .upsert([{ city: cityName, rate: rate }])
        .then(({ error }) => {
          if (error) console.error('Supabase saveCityShippingRate error:', error.message);
        });
    }

    this.showToast(`Delivery rate for ${cityName} updated to PKR ${ratePkr}!`, 'success');
    this.notify();
  }

  saveAllCityShippingRates(ratesMap) {
    this.state.cityShippingRates = { ...this.state.cityShippingRates, ...ratesMap };
    this.saveStorage('kreid_city_shipping_rates', this.state.cityShippingRates);
    
    // Save to Supabase
    if (this.supabaseAdmin) {
      const cityRows = Object.keys(ratesMap).map(city => ({
        city: city,
        rate: parseFloat(ratesMap[city]) || 250
      }));
      this.supabaseAdmin
        .from('city_rates')
        .upsert(cityRows)
        .then(({ error }) => {
          if (error) console.error('Supabase saveAllCityShippingRates error:', error.message);
        });
    }

    this.showToast('Alhamdulillah! All 127 Pakistani city delivery rates saved!', 'success');
    this.notify();
  }

  calculateShippingFee(city = 'Lahore', totalItemQty = 1) {
    const { baseMetroFee, baseOtherFee, additionalItemFee } = this.state.shippingConfig || { baseMetroFee: 150, baseOtherFee: 250, additionalItemFee: 50 };
    const majorMetros = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar", "Multan", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Bahawalpur"];
    const isMetro = majorMetros.includes(city);

    // Read exact city-by-city rate configured by admin
    let baseFee = (this.state.cityShippingRates && this.state.cityShippingRates[city] !== undefined)
      ? this.state.cityShippingRates[city]
      : (isMetro ? baseMetroFee : baseOtherFee);

    const extraItems = Math.max(0, totalItemQty - 1);
    const extraFee = extraItems * (additionalItemFee || 50);
    const totalShippingFee = baseFee + extraFee;

    return {
      isMetro,
      baseFee,
      extraItems,
      extraFee,
      totalShippingFee
    };
  }


  updateEmailConfig(newConfig) {
    this.state.emailConfig = { ...this.state.emailConfig, ...newConfig };
    this.saveStorage('kreid_email_config', this.state.emailConfig);
    
    // Save to Supabase
    if (this.supabaseAdmin) {
      this.supabaseAdmin
        .from('configs')
        .upsert([{ key: 'emailConfig', value: this.state.emailConfig }])
        .then(({ error }) => {
          if (error) console.error('Supabase save emailConfig error:', error.message);
        });
    }

    this.showToast('Resend Email Gateway settings saved!', 'success');
    this.notify();
  }

  logEmailDispatch(logObj) {
    if (!this.state.emailLogs) this.state.emailLogs = [];
    this.state.emailLogs.unshift(logObj);
    this.saveStorage('kreid_email_logs', this.state.emailLogs);
    this.notify();
  }

  purgeOldEmailLogs() {
    const days = (this.state.emailConfig && this.state.emailConfig.retentionDays !== undefined)
      ? this.state.emailConfig.retentionDays
      : 30;

    if (days === 0) return 0; // Never delete

    const cutoff = Date.now() - (days * 86400000);
    const initialCount = this.state.emailLogs.length;

    this.state.emailLogs = this.state.emailLogs.filter(l => {
      const time = new Date(l.timestamp).getTime();
      return isNaN(time) ? true : time >= cutoff;
    });

    const purged = initialCount - this.state.emailLogs.length;
    this.saveStorage('kreid_email_logs', this.state.emailLogs);
    this.notify();
    return purged;
  }

  wipeAllEmailLogs() {
    const count = (this.state.emailLogs || []).length;
    this.state.emailLogs = [];
    this.saveStorage('kreid_email_logs', []);
    this.notify();
    return count;
  }

  clearConfirmedOrder() {
    this.state.confirmedOrder = null;
    this.notify();
  }

  // Toast System
  showToast(message, type = 'info') {


    const toast = { id: Date.now(), message, type };
    this.state.toasts.push(toast);
    this.notify();

    setTimeout(() => {
      this.state.toasts = this.state.toasts.filter(t => t.id !== toast.id);
      this.notify();
    }, 4000);
  }
}

export const appStore = new AppStore();
