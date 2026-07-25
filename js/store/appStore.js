/**
 * KREID Central Reactive Store & State Manager
 * Handles local persistence, state changes, subscribers, order/coupon workflows, and WhatsApp messaging engine.
 */

import { initialProducts } from '../data/products.js';

class AppStore {
  constructor() {
    this.subscribers = [];
    
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
      // Streamlined Primary WhatsApp Gateway State
      whatsappConfig: this.loadStorage('kreid_wa_config', {
        primaryProvider: "OpenWA / Baileys Engine",
        primaryEndpoint: "http://localhost:3000/api/whatsapp/send"
      }),
      whatsappSession: this.loadStorage('kreid_wa_session', {
        status: "CONNECTED",
        linkedNumber: "+92 300 1234567",
        pairingCode: "K8R3-9W21"
      }),
      whatsappTemplates: this.loadStorage('kreid_wa_templates', {
        order_placed: "Assalam-o-Alaikum [Customer Name]! Thank you for your order #[Order ID] at KREID COUTURE. Total: PKR [Total PKR]. Courier: [Courier]. Tracking #: [Tracking Number]. Our team will verify and dispatch your order shortly!",
        status_shipped: "Hi [Customer Name]! Great news! Your KREID order #[Order ID] has been SHIPPED via [Courier]. Tracking #: [Tracking Number]. Track live at KREID portal!",
        status_delivered: "Assalam-o-Alaikum [Customer Name]! Your KREID order #[Order ID] has been DELIVERED. Thank you for choosing KREID COUTURE! We hope you love your outfit."
      }),
      whatsappFollowUps: this.loadStorage('kreid_wa_followups', [
        {
          orderId: "ORD-98231",
          customerName: "Zain Ali",
          phone: "+92 300 9876543",
          sendTime: "Today at 18:30 (In 2 Hours)",
          status: "SCHEDULED"
        }
      ]),
      whatsappLogs: this.loadStorage('kreid_wa_logs', [
        {
          phone: "+92 300 9876543",
          event: "ORDER_PLACED",
          gateway: "Primary (OpenWA Engine)",
          timestamp: "2026-07-25 15:30"
        },
        {
          phone: "+92 321 4567890",
          event: "STATUS_SHIPPED",
          gateway: "Primary (OpenWA Engine)",
          timestamp: "2026-07-25 12:15"
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
      trackedOrder: null,
      toasts: []
    };
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

  // Primary WhatsApp Gateway Actions
  sendWhatsAppNotification(eventType, orderData) {
    const phone = orderData.phone || "+92 300 1234567";
    const templates = this.state.whatsappTemplates;
    let templateText = templates[eventType] || templates.order_placed || "Hello from KREID COUTURE!";

    // Replace tags
    templateText = templateText
      .replace(/\[Customer Name\]/g, orderData.customerName || 'Valued Customer')
      .replace(/\[Order ID\]/g, orderData.id || 'N/A')
      .replace(/\[Total PKR\]/g, orderData.total ? orderData.total.toLocaleString() : '0')
      .replace(/\[Courier\]/g, orderData.courier || 'Trax Logistics')
      .replace(/\[Tracking Number\]/g, orderData.trackingNo || 'TRX-101');

    const gatewayUsed = `Primary (${this.state.whatsappConfig.primaryProvider})`;

    const logItem = {
      phone,
      event: eventType.toUpperCase(),
      gateway: gatewayUsed,
      timestamp: new Date().toLocaleString('en-US', { hour12: false })
    };

    this.state.whatsappLogs.unshift(logItem);
    this.saveStorage('kreid_wa_logs', this.state.whatsappLogs);

    this.showToast(`💬 WhatsApp notification sent to ${phone}!`, 'success');
    this.notify();
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
    this.showToast('Primary WhatsApp Gateway Settings Saved!', 'success');
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

  getCartShippingFee() {
    const subtotal = this.getCartSubtotal();
    if (subtotal >= 5000 || (this.state.activeCoupon && this.state.activeCoupon.freeShipping)) {
      return 0;
    }
    return 200;
  }

  getCartTotal() {
    const subtotal = this.getCartSubtotal();
    const discount = this.getCartDiscount();
    const shipping = this.getCartShippingFee();
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

    const newOrder = {
      id: orderId,
      trackingNo,
      ...orderData,
      items: [...this.state.cart],
      subtotal: this.getCartSubtotal(),
      discount: this.getCartDiscount(),
      shippingFee: this.getCartShippingFee(),
      total: this.getCartTotal(),
      status: "Processing",
      timestamp: Date.now(),
      date: new Date().toLocaleString('en-US', { hour12: false })
    };

    // Deduct stock
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
    this.clearCart();

    // Trigger Automated WhatsApp Notification via Primary Gateway
    this.sendWhatsAppNotification('order_placed', newOrder);

    // Schedule 2-Hour Follow Up Message
    this.state.whatsappFollowUps.unshift({
      orderId: newOrder.id,
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      sendTime: "In 2 Hours (" + new Date(Date.now() + 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ")",
      status: "SCHEDULED"
    });
    this.saveStorage('kreid_wa_followups', this.state.whatsappFollowUps);

    this.showToast(`Order #${newOrder.id} confirmed! Tracking: ${newOrder.trackingNo}`, 'success');
    this.notify();
    return newOrder;
  }

  // Admin Actions
  updateOrderStatus(orderId, newStatus) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.saveStorage('kreid_orders', this.state.orders);
      
      // Trigger WhatsApp status notification
      const eventKey = 'status_' + newStatus.toLowerCase();
      this.sendWhatsAppNotification(eventKey, order);

      this.showToast(`Order #${orderId} status updated to "${newStatus}"`, 'success');
      this.notify();
    }
  }

  saveProduct(productData) {
    if (productData.id) {
      const index = this.state.products.findIndex(p => p.id === productData.id);
      if (index > -1) {
        this.state.products[index] = { ...this.state.products[index], ...productData };
        this.showToast(`Product "${productData.name}" updated!`, 'success');
      }
    } else {
      const newProd = {
        ...productData,
        id: "prod-" + (this.state.products.length + 1),
        rating: 5.0,
        reviewCount: 1,
        inStock: (productData.stock > 0)
      };
      this.state.products.unshift(newProd);
      this.showToast(`Product "${newProd.name}" added to catalog!`, 'success');
    }
    this.saveStorage('kreid_products', this.state.products);
    this.notify();
  }

  deleteProduct(productId) {
    this.state.products = this.state.products.filter(p => p.id !== productId);
    this.saveStorage('kreid_products', this.state.products);
    this.showToast(`Product deleted from catalog`, 'info');
    this.notify();
  }

  toggleCouponStatus(code) {
    const coupon = this.state.coupons.find(c => c.code === code);
    if (coupon) {
      coupon.isActive = !coupon.isActive;
      this.saveStorage('kreid_coupons', this.state.coupons);
      this.showToast(`Coupon ${code} is now ${coupon.isActive ? 'ACTIVE' : 'DEACTIVATED'}`, 'info');
      this.notify();
    }
  }

  deleteCoupon(code) {
    this.state.coupons = this.state.coupons.filter(c => c.code !== code);
    this.saveStorage('kreid_coupons', this.state.coupons);
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
    this.showToast(`Coupon code ${cleanCode} saved!`, 'success');
    this.notify();
  }

  savePaymentSettings(newSettings) {
    this.state.paymentSettings = { ...this.state.paymentSettings, ...newSettings };
    this.saveStorage('kreid_payment_settings', this.state.paymentSettings);
    this.showToast(`Payment account settings updated!`, 'success');
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
