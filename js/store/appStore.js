/**
 * KREID Central Reactive Store & State Manager
 * Handles local persistence, state changes, subscribers, and order/coupon workflows.
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
          timestamp: Date.now() - 3600000 * 2, // 2 hours ago
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
          timestamp: Date.now() - 3600000 * 5, // 5 hours ago
          date: "2026-07-25 12:15"
        },
        {
          id: "ORD-98229",
          trackingNo: "LPD-1092841",
          customerName: "Hamza Malik",
          email: "hamza@example.pk",
          phone: "+92 333 1122334",
          address: "Gulberg III, Main Boulevard",
          city: "Lahore",
          courier: "Leopards Courier",
          paymentMethod: "Cash on Delivery",
          items: [
            { id: "prod-3", name: "Air Jordan 4 – Nigel Sylvester 'BIKE AIR'", price: 6800, quantity: 1, selectedSize: "43", selectedColor: "Off-White / Sail" }
          ],
          subtotal: 6800,
          discount: 0,
          shippingFee: 0,
          total: 6800,
          status: "Delivered",
          timestamp: Date.now() - 3600000 * 9, // 9 hours ago
          date: "2026-07-25 08:45"
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
