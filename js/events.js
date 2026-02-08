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
    document.querySelectorAll('a.btn-primary').forEach(btn => {
        if (btn.textContent.includes('REGISTER')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openEventModal(1);
            });
        }
    });

    let currentEvent = null;

    async function openEventModal(id) {
        try {
            // Static Fetch
            const response = await fetch('data/events.json');
            const events = await response.json();
            const event = events.find(e => e.id == id);

            if (event) {
                currentEvent = event;
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
            // Fallback content if fetch fails
            eventTitleDisplay.textContent = "Join us for our upcoming event.";
            eventModal.style.display = 'block';
        }
    }

    // Close Modal
    if (closeEventBtn) {
        closeEventBtn.addEventListener('click', () => {
            eventModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Submit Registration (Static -> WhatsApp)
    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = Security.sanitizeInput(document.getElementById('reg-name').value);
            const email = document.getElementById('reg-email').value;
            const phone = Security.sanitizeInput(document.getElementById('reg-phone').value);
            const title = eventTitleDisplay.textContent;

            // Validate inputs
            if (!name || !email || !phone) {
                alert('Please fill in all required fields.');
                return;
            }

            if (!Security.isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            if (!Security.isValidPhone(phone)) {
                alert('Please enter a valid phone number.');
                return;
            }

            const whatsappMsg = `Hello, I want to register for *${title}*.%0A%0AName: ${name}%0AEmail: ${email}%0APhone: ${phone}`;
            const whatsappUrl = `https://wa.me/233557894935?text=${whatsappMsg}`;

            // Open WhatsApp
            window.open(whatsappUrl, '_blank');

            // Show Success UI
            eventForm.querySelectorAll('.form-group').forEach(group => {
                group.style.display = 'none';
            });
            registerBtn.style.display = 'none';

            // Display event meeting link if available
            if (meetingLinkContainer) {
                if (currentEvent && currentEvent.link) {
                    const sanitizedLink = Security.sanitizeUrl(currentEvent.link);
                    const escapedTitle = Security.escapeHtml(currentEvent.title);
                    
                    meetingLinkContainer.innerHTML = `<p>Your request has been sent via WhatsApp!</p><p>Join the event here: <a href="${sanitizedLink}" target="_blank" rel="noopener noreferrer" style="color: #c62828; font-weight: bold;">Click to join ${escapedTitle}</a></p>`;
                    if (meetingLink) {
                        meetingLink.href = sanitizedLink;
                    }
                } else {
                    meetingLinkContainer.textContent = 'Your request has been sent via WhatsApp! We will send you the meeting details shortly.';
                }
            }
            if (eventSuccessMsg) eventSuccessMsg.style.display = 'block';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target == eventModal) {
            eventModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

});
