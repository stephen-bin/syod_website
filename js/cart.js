// Cart State Management

const Cart = {
    items: [],

    // Config
    storageKey: 'syod_cart',

    init() {
        this.load();
        this.renderCount();
    },

    load() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse cart", e);
                this.items = [];
            }
        }
    },

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        this.renderCount();
        // Emit event so other parts of app can react
        document.dispatchEvent(new CustomEvent('cart-updated'));
    },

    add(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        this.save();
        alert(`${product.title} added to cart!`);
    },

    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },

    updateQuantity(id, change) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.remove(id);
            } else {
                this.save();
            }
        }
    },

    clear() {
        this.items = [];
        this.save();
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    renderCount() {
        const countEl = document.getElementById('cart-count');
        if (countEl) {
            countEl.textContent = this.getCount();
        }
    },

    // UI Rendering
    renderCartModal() {
        const container = document.getElementById('cart-items-container');
        const totalEl = document.getElementById('cart-total-price');

        if (!container || !totalEl) return;

        container.innerHTML = '';

        if (this.items.length === 0) {
            container.innerHTML = '<p class="text-center">Your cart is empty.</p>';
            totalEl.textContent = 'GH₵ 0.00';
            return;
        }

        this.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="item-info">
                    <h4>${item.title}</h4>
                    <span class="item-price">GH₵ ${item.price}</span>
                </div>
                <div class="item-controls">
                    <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', 1)">+</button>
                    <i class="fa-solid fa-trash remove-btn" onclick="Cart.remove('${item.id}')"></i>
                </div>
            `;
            container.appendChild(itemEl);
        });

        totalEl.textContent = `GH₵ ${this.getTotal().toFixed(2)}`;
    },

    openModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            this.renderCartModal();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    setupListeners() {
        // Add to Cart Buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const product = {
                    id: btn.dataset.id,
                    title: btn.dataset.title,
                    price: parseFloat(btn.dataset.price)
                };
                this.add(product);
            });
        });

        // Cart Icon
        const openBtn = document.getElementById('openCartBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openModal());
        }

        // Close Cart Modal
        const closeBtn = document.getElementById('closeCartBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Close on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('cartModal');
            if (e.target == modal) {
                this.closeModal();
            }
        });

        // Proceed to Checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.closeModal();
                const paymentModal = document.getElementById('paymentModal');
                if (paymentModal) {
                    paymentModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            });
        }
    }
};

// Expose to global scope
window.Cart = Cart;
