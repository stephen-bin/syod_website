document.addEventListener('DOMContentLoaded', () => {
    // Modal Elements
    const modal = document.getElementById('paymentModal');
    const openBtns = document.querySelectorAll('.open-payment-modal');
    // Use specific ID to avoid conflict with Cart modal
    const closeBtn = document.getElementById('closePaymentBtn') || document.querySelector('#paymentModal .close-modal');
    const whatsappBtn = document.getElementById('whatsappBtn');

    // Inputs
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const notesInput = document.getElementById('notes');

    // Configuration
    const WHATSAPP_NUMBER = "233536206077";

    // Open Modal
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            // Render PayPal button when modal opens (if not already rendered)
            renderPayPalButton();
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

    // PayPal Integration
    let paypalButtonRendered = false;

    function renderPayPalButton() {
        if (paypalButtonRendered) return;

        const container = document.getElementById('paypal-button-container');
        if (!container) return;

        if (typeof paypal === 'undefined') {
            container.innerHTML = '<p class="text-danger">PayPal SDK failed to load. Please refresh.</p>';
            return;
        }

        try {
            paypal.Buttons({
                // Sets up the transaction when a payment button is clicked
                createOrder: (data, actions) => {
                    if (!validateForm()) {
                        // If validation fails, we can't easily stop the PayPal popup from opening 
                        // in this flow without more complex logic, but we can error out here.
                        // Better UX: disable button until valid, but for now:
                        throw new Error('Form validation failed');
                    }

                    const amount = window.Cart && window.Cart.items.length > 0
                        ? window.Cart.getTotal()
                        : 45; // Default price if cart empty (should verify)

                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount.toFixed(2) // Can also add currency_code: 'USD'
                            },
                            description: "Book Purchase: The Spiritual Youth on a Date"
                        }]
                    });
                },
                // Finalize the transaction after payer approval
                onApprove: (data, actions) => {
                    return actions.order.capture().then(function (orderData) {
                        // Successful capture
                        console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
                        const transaction = orderData.purchase_units[0].payments.captures[0];

                        alert(`Transaction ${transaction.status}: ${transaction.id}\n\nThank you for your purchase!`);

                        // Clear cart
                        if (window.Cart) window.Cart.clear();

                        // Close modal
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';

                        // Optional: Send order details to backend if you had one, 
                        // or Trigger a Zapier webhook / EmailJS here.
                    });
                },
                onError: (err) => {
                    console.error(err);
                    // Don't alert if it's just the validation error we threw
                    if (err.message !== 'Form validation failed') {
                        alert('An error occurred with PayPal. Please try again or use WhatsApp.');
                    }
                }
            }).render('#paypal-button-container');

            paypalButtonRendered = true;
        } catch (error) {
            console.error('PayPal Render Error:', error);
        }
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
