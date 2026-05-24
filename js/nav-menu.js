// Mobile hamburger menu (open, close, backdrop, escape key).
export function initNavMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navBackdrop = document.getElementById('navBackdrop');
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');

    function setMenuOpen(isOpen) {
        if (!navMenu || !menuToggle) return;

        menuToggle.classList.toggle('is-open', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

        navMenu.classList.toggle('active', isOpen);
        navMenu.setAttribute('aria-hidden', String(!isOpen));

        document.body.classList.toggle('no-scroll', isOpen);
        document.body.classList.toggle('menu-open', isOpen);

        if (navBackdrop) {
            navBackdrop.hidden = !isOpen;
            navBackdrop.setAttribute('aria-hidden', String(!isOpen));
        }
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = !navMenu.classList.contains('active');
            setMenuOpen(isOpen);
        });
    }

    if (navBackdrop) {
        navBackdrop.addEventListener('click', closeMenu);
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    function syncMenuState() {
        const isMobile = window.matchMedia('(max-width: 900px)').matches;

        if (!isMobile) {
            closeMenu();
            navMenu?.removeAttribute('aria-hidden');
            return;
        }

        if (!navMenu?.classList.contains('active')) {
            navMenu?.setAttribute('aria-hidden', 'true');
        }
    }

    syncMenuState();

    window.addEventListener('resize', () => {
        if (window.matchMedia('(min-width: 901px)').matches) {
            closeMenu();
        }
        syncMenuState();
    });

    return { navLinks };
}
