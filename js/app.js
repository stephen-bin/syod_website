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
});
