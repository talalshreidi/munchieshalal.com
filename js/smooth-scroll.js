// Smooth scroll for nav links; keeps the URL clean (no #contact in the bar).

const SCROLL_BUFFER_PX = 16;

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function cleanUrl() {
    const { pathname, search } = window.location;

    if (!window.location.hash) return;

    history.replaceState(null, '', pathname + search);
}

export function getScrollOffset() {
    const header = document.getElementById('header');

    if (header) {
        return header.getBoundingClientRect().height + SCROLL_BUFFER_PX;
    }

    const value = getComputedStyle(document.documentElement).scrollPaddingTop;
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 96;
}

export function scrollToTarget(target, behavior = 'smooth') {
    const resolvedBehavior = prefersReducedMotion() ? 'auto' : behavior;

    const top =
        window.scrollY + target.getBoundingClientRect().top - getScrollOffset();

    window.scrollTo({
        top: Math.max(0, top),
        behavior: resolvedBehavior
    });
}

function scrollToHash(hash, behavior = 'smooth') {
    if (!hash || hash === '#') return false;

    const target = document.querySelector(hash);

    if (!target) return false;

    scrollToTarget(target, behavior);
    return true;
}

export function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function handleClick(event) {
            const hash = this.getAttribute('href');

            if (!hash || hash === '#') return;

            const target = document.querySelector(hash);

            if (!target) return;

            event.preventDefault();
            scrollToTarget(target, 'smooth');
            cleanUrl();
        });
    });

    // Old shared links like site.com#contact still work once, then we strip the hash.
    window.addEventListener('hashchange', () => {
        const { hash } = window.location;

        if (!hash || hash === '#') return;

        scrollToHash(hash, 'auto');
        cleanUrl();
    });

    initHashScrollOnLoad();
}

function initHashScrollOnLoad() {
    let hashApplied = false;

    function applyHashScroll() {
        if (hashApplied) return;

        const { hash } = window.location;

        if (!hash || hash === '#') return;

        const target = document.querySelector(hash);

        if (!target) {
            cleanUrl();
            return;
        }

        hashApplied = true;
        scrollToTarget(target, 'auto');

        requestAnimationFrame(() => {
            cleanUrl();
        });
    }

    function scheduleApply() {
        requestAnimationFrame(() => {
            requestAnimationFrame(applyHashScroll);
        });
    }

    if (document.readyState === 'complete') {
        scheduleApply();
    } else {
        window.addEventListener('load', scheduleApply, { once: true });
    }

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            hashApplied = false;
            scheduleApply();
        }
    });

    window.addEventListener('orientationchange', () => {
        hashApplied = false;
        setTimeout(scheduleApply, 150);
    });
}
