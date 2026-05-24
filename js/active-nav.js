// Highlights the nav link for whichever section you're looking at.
import { getScrollOffset } from './smooth-scroll.js';

export function initActiveNav(navLinks) {
    const sections = document.querySelectorAll('main section[id]');
    let ticking = false;

    function updateActiveLink() {
        let current = '';
        const anchorLine = getScrollOffset() + 24;

        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();

            if (rect.top <= anchorLine && rect.bottom >= anchorLine) {
                current = section.id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }

    function onScroll() {
        if (ticking) return;

        ticking = true;
        requestAnimationFrame(() => {
            updateActiveLink();
            ticking = false;
        });
    }

    updateActiveLink();
    window.addEventListener('scroll', onScroll, { passive: true });
}
