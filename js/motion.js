// Fade-in on scroll and the hero load animation. Skips heavy motion if the user prefers reduced motion.
export function initMotion() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (reducedMotion) {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-inview'));
        document.body.classList.add('is-intro', 'is-loaded', 'is-hero-ready');
        return;
    }

    if (isTouch) {
        document.body.classList.add('is-touch');
    }

    initHeaderScroll();
    initRevealObserver(isTouch);
    startLoadSequence(isTouch);
}

function initHeaderScroll() {
    const header = document.getElementById('header');

    if (!header) return;

    const onScroll = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 20);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

function initRevealObserver(isTouch) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add('is-inview');
                observer.unobserve(entry.target);
            });
        },
        isTouch
            ? { threshold: 0.06, rootMargin: '0px 0px -20px 0px' }
            : { threshold: 0.14, rootMargin: '0px 0px -48px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
        if (el.closest('.hero') || el.closest('.info-strip')) return;
        observer.observe(el);
    });
}

function startLoadSequence(isTouch) {
    const staggerMs = isTouch ? 60 : 85;
    const heroDoneMs = isTouch ? 880 : 1280;
    const infoStaggerMs = isTouch ? 55 : 75;

    document.body.classList.add('is-intro');

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.add('is-loaded');
            triggerHeroEntrance(staggerMs);

            window.setTimeout(() => {
                document.body.classList.add('is-hero-ready');
                triggerInfoStripEntrance(infoStaggerMs);
            }, heroDoneMs);
        });
    });
}

function triggerHeroEntrance(staggerMs) {
    const heroReveals = document.querySelectorAll('.hero .reveal');

    heroReveals.forEach((el, index) => {
        el.style.setProperty('--hero-i', String(index));
        el.style.transitionDelay = `${index * staggerMs}ms`;
    });

    requestAnimationFrame(() => {
        heroReveals.forEach((el) => el.classList.add('is-inview'));
    });
}

function triggerInfoStripEntrance(staggerMs) {
    const cells = document.querySelectorAll('.info-strip .reveal');

    cells.forEach((el, index) => {
        el.style.transitionDelay = `${index * staggerMs}ms`;
        el.classList.add('is-inview');
    });
}
