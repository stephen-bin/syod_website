document.addEventListener('DOMContentLoaded', () => {
    const showcaseContainer = document.getElementById('showcase-grid');

    if (!showcaseContainer) return;

    // Embedded data to avoid local CORS issues with fetch
    const mockups = [
        {
            "src": "assets/mockups/Book_Mockup_2.png",
            "alt": "Premium Book Mockup - Perspective View",
            "title": "Elegant Perspective"
        },
        {
            "src": "assets/mockups/Book_Mockup_5.png",
            "alt": "Book Mockup - Standing View",
            "title": "Graceful Standing"
        },
        {
            "src": "assets/mockups/Free_Book_Mockup_1.png",
            "alt": "Free Book Mockup - Cover Detail",
            "title": "Cover Detail"
        },
        {
            "src": "assets/mockups/Free_Book_Mockup_2.png",
            "alt": "Free Book Mockup - Open Pages",
            "title": "Front and Back Cover"
        },
        {
            "src": "assets/mockups/Free_Book_Mockup_4.png",
            "alt": "Free Book Mockup - Floating",
            "title": "Floating Edition"
        },
        {
            "src": "assets/mockups/Free_Book_Mockup_7.png",
            "alt": "Free Book Mockup - Stacked",
            "title": "Stacked Beauty"
        },
        {
            "src": "assets/mockups/Three_Books_Box_Mockup_2.png",
            "alt": "Three Books Box Set Mockup",
            "title": "Collection Set"
        }
    ];

    renderShowcase(mockups, showcaseContainer);
});

function renderShowcase(mockups, container) {
    container.innerHTML = ''; // Clear loading state

    mockups.forEach((mockup, index) => {
        const card = document.createElement('div');
        card.className = 'showcase-card fade-in-up';
        card.style.animationDelay = `${index * 100}ms`;

        // Create image with lazy loading
        const img = document.createElement('img');
        img.dataset.src = mockup.src;
        img.src = mockup.src;
        img.alt = mockup.alt;
        img.loading = 'lazy'; // Native lazy loading
        img.className = 'showcase-img';

        const overlay = document.createElement('div');
        overlay.className = 'showcase-overlay';

        const title = document.createElement('h3');
        title.textContent = mockup.title;

        overlay.appendChild(title);
        card.appendChild(img);
        card.appendChild(overlay);

        container.appendChild(card);
    });
}
