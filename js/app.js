document.addEventListener('DOMContentLoaded', () => {

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for scroll animations (AOS lightweight replacement)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Initialize elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        el.classList.add('aos-animate');
        observer.observe(el);
    });

    // Video Placeholder Click Interaction
    document.querySelectorAll('.play-trigger').forEach(card => {
        card.addEventListener('click', () => {
            alert('This would open a video modal in the production version!');
        });
    });

    // Initialize Cart
    if (window.Cart) {
        window.Cart.init();
        window.Cart.setupListeners();
    }
    // Campus Distributor Interaction
    const campusTags = document.querySelectorAll('.campus-tag');
    const distributorInfoBox = document.getElementById('distributor-info');

    if (campusTags.length > 0 && distributorInfoBox) {
        campusTags.forEach(tag => {
            tag.addEventListener('click', () => {
                // Remove active class from all
                campusTags.forEach(t => t.classList.remove('active'));
                // Add active class to clicked
                tag.classList.add('active');

                const name = tag.getAttribute('data-name');
                const phone = tag.getAttribute('data-phone');
                const phoneLink = phone.replace(/\s/g, '');

                // Update info box with fade effect
                distributorInfoBox.style.opacity = '0';
                setTimeout(() => {
                    distributorInfoBox.innerHTML = `
                        <div>
                            <h4>${tag.textContent} Representative</h4>
                            <p class="mb-1">${name}</p>
                            <a href="tel:${phoneLink}"><i class="fa-solid fa-phone"></i> ${phone}</a>
                        </div>
                    `;
                    distributorInfoBox.style.opacity = '1';
                }, 200);
            });
        });
    }
});
