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
    const PAYSTACK_URL = "https://paystack.com/pay/stephen-book-preorder";
    const WHATSAPP_NUMBER = "233557894935"; // Stephen's WhatsApp number in international format

    // Validations
    function validateForm() {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const address = addressInput.value.trim();

        if (!name || !email || !phone || !address) {
            alert('Please fill in Name, Email, Phone, and Address.');
            return false;
        }

        if (window.Security) {
            if (!window.Security.isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return false;
            }

            if (!window.Security.isValidPhone(phone)) {
                alert('Please enter a valid phone number.');
                return false;
            }
        }

        return true;
    }

    // Paystack Handler (Static Redirect)
    if (paystackBtn) {
        paystackBtn.addEventListener('click', () => {
            if (validateForm()) {
                const confirmed = confirm("You are being redirected to the secure payment page.\n\nNote: This is a fixed pre-order price check. Proceed?");
                if (confirmed) {
                    window.location.href = PAYSTACK_URL;
                }
            }
        });
    }

    // WhatsApp Handler
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            if (validateForm()) {
                // Sanitize inputs
                const name = window.Security ? window.Security.sanitizeInput(nameInput.value) : nameInput.value;
                const email = emailInput.value.trim();
                const phone = window.Security ? window.Security.sanitizeInput(phoneInput.value) : phoneInput.value;
                const address = window.Security ? window.Security.sanitizeInput(addressInput.value) : addressInput.value;

                let message = `Hello Stephen, I want to place an order.%0A%0A*Name*: ${encodeURIComponent(name)}%0A*Email*: ${encodeURIComponent(email)}%0A*Phone*: ${encodeURIComponent(phone)}%0A*Address*: ${encodeURIComponent(address)}`;

                if (notesInput && notesInput.value) {
                    const notes = window.Security ? window.Security.sanitizeInput(notesInput.value) : notesInput.value;
                    message += `%0A*Notes*: ${encodeURIComponent(notes)}`;
                }

                message += `%0A%0A*Order Summary*:`;

                if (window.Cart && window.Cart.items.length > 0) {
                    window.Cart.items.forEach(item => {
                        const itemTitle = window.Security ? window.Security.sanitizeInput(item.title) : item.title;
                        message += `%0A- ${item.quantity}x ${encodeURIComponent(itemTitle)} (GH₵ ${parseFloat(item.price).toFixed(2)})`;
                    });
                    message += `%0A%0A*Total*: GH₵ ${window.Cart.getTotal().toFixed(2)}`;
                } else {
                    message += `%0A- 1x The Spiritual Youth on a Date (GH₵ 55)%0A%0A*Total*: GH₵ 55.00`;
                }

                const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
                window.open(url, '_blank');
            }
        });
    }

    // Open Modal logic
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});
