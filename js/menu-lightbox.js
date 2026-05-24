// Tap a menu board to open it full-screen; swipe or use arrows to switch.
const SWIPE_THRESHOLD_PX = 72;
const SWIPE_RATIO = 1.4;

export function initMenuLightbox() {
    const lightbox = document.getElementById('menuLightbox');

    if (!lightbox) {
        return;
    }

    const triggers = document.querySelectorAll('[data-menu-lightbox-index]');

    if (!triggers.length) {
        return;
    }

    const slides = [...triggers].map((trigger) => ({
        src: trigger.dataset.menuSrc ?? '',
        title: trigger.dataset.menuTitle ?? '',
        alt: trigger.querySelector('img')?.getAttribute('alt') ?? '',
    }));

    const backdrop = lightbox.querySelector('.menu-lightbox__backdrop');
    const closeBtn = lightbox.querySelector('.menu-lightbox__close');
    const prevBtn = lightbox.querySelector('[data-menu-prev]');
    const nextBtn = lightbox.querySelector('[data-menu-next]');
    const imageEl = lightbox.querySelector('.menu-lightbox__img');
    const titleEl = lightbox.querySelector('.menu-lightbox__title');
    const counterEl = lightbox.querySelector('.menu-lightbox__counter');
    const viewport = lightbox.querySelector('.menu-lightbox__viewport');
    const stage = lightbox.querySelector('.menu-lightbox__stage');

    let activeIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchGesture = null;

    triggers.forEach((trigger, index) => {
        trigger.addEventListener('click', () => open(index));
    });

    [backdrop, closeBtn].forEach((el) => {
        el?.addEventListener('click', close);
    });

    prevBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        go(-1);
    });

    nextBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
        go(1);
    });

    lightbox.addEventListener('keydown', (event) => {
        if (lightbox.hidden) {
            return;
        }

        if (event.key === 'Escape') {
            close();
        }

        if (event.key === 'ArrowLeft') {
            go(-1);
        }

        if (event.key === 'ArrowRight') {
            go(1);
        }
    });

    const swipeSurface = stage ?? viewport;

    swipeSurface?.addEventListener(
        'touchstart',
        (event) => {
            if (event.target.closest('.menu-lightbox__nav')) {
                return;
            }

            if (event.touches.length !== 1 || isViewportZoomed()) {
                touchGesture = 'pinch';
                return;
            }

            touchGesture = 'pan';
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        },
        { passive: true }
    );

    swipeSurface?.addEventListener(
        'touchmove',
        (event) => {
            if (event.touches.length > 1) {
                touchGesture = 'pinch';
            }
        },
        { passive: true }
    );

    swipeSurface?.addEventListener(
        'touchend',
        (event) => {
            if (lightbox.hidden || touchGesture !== 'pan' || event.changedTouches.length !== 1) {
                resetTouchGesture();
                return;
            }

            if (isViewportZoomed()) {
                resetTouchGesture();
                return;
            }

            const deltaX = event.changedTouches[0].clientX - touchStartX;
            const deltaY = event.changedTouches[0].clientY - touchStartY;

            resetTouchGesture();

            if (
                Math.abs(deltaX) < SWIPE_THRESHOLD_PX ||
                Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_RATIO
            ) {
                return;
            }

            if (deltaX < 0) {
                go(1);
            } else {
                go(-1);
            }
        },
        { passive: true }
    );

    swipeSurface?.addEventListener('touchcancel', resetTouchGesture, { passive: true });

    function resetTouchGesture() {
        touchGesture = null;
    }

    function isViewportZoomed() {
        const vv = window.visualViewport;

        if (!vv) {
            return false;
        }

        return vv.scale > 1.02;
    }

    function open(index) {
        activeIndex = index;
        render();
        lightbox.hidden = false;
        lightbox.setAttribute('tabindex', '-1');
        document.body.classList.add('menu-lightbox-open');
        requestAnimationFrame(() => {
            lightbox.classList.add('is-open');
            lightbox.focus();
        });
    }

    function close() {
        lightbox.classList.remove('is-open');
        document.body.classList.remove('menu-lightbox-open');

        window.setTimeout(() => {
            if (!lightbox.classList.contains('is-open')) {
                lightbox.hidden = true;
                lightbox.removeAttribute('tabindex');

                if (imageEl instanceof HTMLImageElement) {
                    imageEl.removeAttribute('src');
                }
            }
        }, 340);
    }

    function go(direction) {
        activeIndex = (activeIndex + direction + slides.length) % slides.length;
        render();
    }

    function render() {
        const slide = slides[activeIndex];

        if (!slide || !(imageEl instanceof HTMLImageElement)) {
            return;
        }

        imageEl.src = slide.src;
        imageEl.alt = slide.alt || slide.title;
        viewport?.scrollTo(0, 0);

        if (titleEl) {
            titleEl.textContent = slide.title;
        }

        if (counterEl) {
            counterEl.textContent = `${activeIndex + 1} / ${slides.length}`;
        }

        const showNav = slides.length > 1;
        prevBtn?.toggleAttribute('hidden', !showNav);
        nextBtn?.toggleAttribute('hidden', !showNav);
    }
}
