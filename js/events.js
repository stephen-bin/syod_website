document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const eventModal = document.getElementById('eventModal');
    const closeEventBtn = document.getElementById('closeEventBtn');
    const eventForm = document.getElementById('eventForm');
    const eventSuccessMsg = document.getElementById('event-success-msg');
    const registerBtn = document.getElementById('registerBtn');
    const meetingLinkContainer = document.getElementById('meeting-link-container');
    const meetingLink = document.getElementById('meeting-link');
    const eventIdInput = document.getElementById('eventId');
    const eventTitleDisplay = document.getElementById('event-title-display');

    // Register Buttons
    // Find generic "Register" buttons or specific event buttons
    // For now, let's attach to the "REGISTER FOR FREE" button in the events section
    document.querySelectorAll('a.btn-primary').forEach(btn => {
        if (btn.textContent.includes('REGISTER')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openEventModal(1); // Hardcoded ID 1 for "Book Launch"
            });
        }
    });

    async function openEventModal(id) {
        try {
            // Determine source: API or Static JSON
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const url = isLocal ? '/api/events' : 'data/events.json';

            const response = await fetch(url);
            const events = await response.json();
            const event = events.find(e => e.id == id);

            if (event) {
                eventIdInput.value = event.id;
                eventTitleDisplay.textContent = `Join us for: ${event.title}`;
                eventModal.style.display = 'block';
                document.body.style.overflow = 'hidden';

                // Reset form
                eventForm.reset();
                if (eventSuccessMsg) eventSuccessMsg.style.display = 'none';
                registerBtn.style.display = 'block';
                eventForm.style.display = 'block';
            }
        } catch (e) {
            console.error(e);
            alert('Could not load event details.');
        }
    }

    // Close Modal
    if (closeEventBtn) {
        closeEventBtn.addEventListener('click', () => {
            eventModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Submit Registration
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const phone = document.getElementById('reg-phone').value;
            const id = eventIdInput.value;

            const originalText = registerBtn.textContent;
            registerBtn.textContent = "Registering...";
            registerBtn.disabled = true;

            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            if (!isLocal) {
                // Static Environment Fallback
                // Since we can't save to DB, we simulate success or redirect to WhatsApp
                const whatsappMsg = `Hello, I want to register for the event.%0AName: ${name}%0AEmail: ${email}`;
                const whatsappUrl = `https://wa.me/233536206077?text=${whatsappMsg}`;

                if (confirm('Online registration requires a server. Would you like to send your details via WhatsApp instead?')) {
                    window.open(whatsappUrl, '_blank');
                    eventModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }

                registerBtn.textContent = originalText;
                registerBtn.disabled = false;
                return;
            }

            try {
                const response = await fetch('/api/register-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventId: id,
                        name,
                        email,
                        phone
                    })
                });

                const result = await response.json();

                if (result.success) {
                    // Show success state
                    eventForm.querySelector('.form-group').parentElement.childNodes.forEach(node => {
                        // Hide inputs roughly
                        if (node.classList && node.classList.contains('form-group')) {
                            node.style.display = 'none';
                        }
                    });

                    // Hide the button
                    registerBtn.style.display = 'none';

                    // Show link
                    if (result.link && meetingLink) {
                        meetingLink.href = result.link;
                        eventSuccessMsg.style.display = 'block';
                    }

                    // Refresh inputs visibility if re-opened? Handled in openEventModal reset
                } else {
                    alert('Registration failed: ' + result.error);
                    registerBtn.textContent = originalText;
                    registerBtn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                alert('An error occurred.');
                registerBtn.textContent = originalText;
                registerBtn.disabled = false;
            }
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target == eventModal) {
            eventModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

});
