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
    const WHATSAPP_NUMBER = "233536206077";

    // Validations
    function validateForm() {
        if (!nameInput.value || !emailInput.value || !phoneInput.value || !addressInput.value) {
            alert('Please fill in Name, Email, Phone, and Address.');
            return false;
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
