document.addEventListener('DOMContentLoaded', () => {
    // Modal Elements
    const modal = document.getElementById('paymentModal');
    const openBtns = document.querySelectorAll('.open-payment-modal');
    // Use specific ID to avoid conflict with Cart modal
    const closeBtn = document.getElementById('closePaymentBtn') || document.querySelector('#paymentModal .close-modal');
    const paystackBtn = document.getElementById('paystackBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');

    // Inputs
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const notesInput = document.getElementById('notes');

    // Configuration
    const WHATSAPP_NUMBER = "233536206077";
    // API URL - defaults to relative path in production, or localhost in dev
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : '/api';

    // Check for Paystack Callback logic on load
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');

    if (reference) {
        verifyPayment(reference);
    }

    async function verifyPayment(ref) {
        try {
            // Retrieve saved order details
            const savedDetails = sessionStorage.getItem('syod_pending_order');
            const orderDetails = savedDetails ? JSON.parse(savedDetails) : {};

            const response = await fetch(`${API_BASE}/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: ref, orderDetails })
            });

            const result = await response.json();
            if (result.success) {
                alert('Payment Successful! Your order has been placed.');
                // Clear URL params
                window.history.replaceState({}, document.title, window.location.pathname);

                if (window.Cart) window.Cart.clear();
                sessionStorage.removeItem('syod_pending_order');
            } else {
                alert('Payment verification failed. Please contact support.');
            }
        } catch (e) {
            console.error(e);
            alert('Error verifying payment.');
        }
    }

    // Open Modal
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // Close Modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Validations
    function validateForm() {
        if (!nameInput.value || !emailInput.value || !phoneInput.value || !addressInput.value) {
            alert('Please fill in Name, Email, Phone, and Address.');
            return false;
        }
        return true;
    }

    function getOrderDetails() {
        return {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            address: addressInput.value,
            notes: notesInput ? notesInput.value : '',
            items: window.Cart ? window.Cart.items : []
        };
    }

    // Paystack Handler
    if (paystackBtn) {
        paystackBtn.addEventListener('click', async () => {
            if (validateForm()) {
                const originalText = paystackBtn.textContent;
                paystackBtn.textContent = "Processing...";
                paystackBtn.disabled = true;

                try {
                    const order = getOrderDetails();
                    const amount = window.Cart && window.Cart.items.length > 0
                        ? window.Cart.getTotal()
                        : 45;

                    // CHECK: Are we on localhost?
                    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

                    if (isLocal) {
                        // Use Backend API
                        const response = await fetch(`${API_BASE}/initiate-payment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: order.email,
                                amount: amount,
                                metadata: order
                            })
                        });

                        const data = await response.json();

                        if (data.authorization_url) {
                            sessionStorage.setItem('syod_pending_order', JSON.stringify(order));
                            window.location.href = data.authorization_url;
                        } else {
                            throw new Error('Backend failed to init payment');
                        }
                    } else {
                        // STATIC FALLBACK (GitHub Pages)
                        // Redirect to the static Paystack Payment Page URL
                        console.warn('Backend not available. Using Static Paystack URL.');
                        // Note: This URL is fixed and might not reflect the exact amount if the user changed qty.
                        // Ideally, you'd use a Paystack "Inline" popup here if you had the Public Key handled purely in frontend,
                        // but for now we follow the plan to redirect to the generic page.
                        window.location.href = PAYSTACK_URL;
                    }

                } catch (error) {
                    console.error(error);
                    // Fallback on error too
                    if (confirm('Automatic checkout failed (likely due to static hosting). Proceed to standard Payment Page?')) {
                        window.location.href = PAYSTACK_URL;
                    }
                    paystackBtn.textContent = originalText;
                    paystackBtn.disabled = false;
                }
            }
        });
    }

    // WhatsApp Handler
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            if (validateForm()) {
                let message = `Hello Stephen, I want to place an order.%0A%0A*Name*: ${nameInput.value}%0A*Email*: ${emailInput.value}%0A*Phone*: ${phoneInput.value}%0A*Address*: ${addressInput.value}`;

                if (notesInput && notesInput.value) {
                    message += `%0A*Notes*: ${notesInput.value}`;
                }

                message += `%0A%0A*Order Summary*:`;

                if (window.Cart && window.Cart.items.length > 0) {
                    window.Cart.items.forEach(item => {
                        message += `%0A- ${item.quantity}x ${item.title} (GH₵ ${item.price})`;
                    });
                    message += `%0A%0A*Total*: GH₵ ${window.Cart.getTotal().toFixed(2)}`;
                } else {
                    message += `%0A- 1x The Spiritual Youth on a Date (GH₵ 45)%0A%0A*Total*: GH₵ 45.00`;
                }

                const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
                window.open(url, '_blank');
            }
        });
    }
});
