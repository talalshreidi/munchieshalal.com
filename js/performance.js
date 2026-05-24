// Pause video and scrolling animations when they're off-screen (saves battery).
export function initPerformance() {
    initHeroVideo();
    initOffscreenMarquees();
    initOffscreenHeroShimmer();
}

function initHeroVideo() {
    const video = document.querySelector('.hero-video');
    const hero = document.querySelector('.hero');

    if (!video || !hero) return;

    video.autoplay = false;
    video.preload = 'none';

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                video.play().catch(() => {});
                return;
            }

            video.pause();
        },
        { threshold: 0.15 }
    );

    observer.observe(hero);
}

function initOffscreenMarquees() {
    const tracks = document.querySelectorAll('.showcase-track, .testimonials-track');

    if (!tracks.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const row = entry.target.querySelector('.showcase-row, .testimonials-row');
                if (!row) return;
                row.classList.toggle('is-offscreen', !entry.isIntersecting);
            });
        },
        { rootMargin: '80px 0px', threshold: 0 }
    );

    tracks.forEach((track) => observer.observe(track));
}

function initOffscreenHeroShimmer() {
    const hero = document.querySelector('.hero');
    const shimmer = document.querySelector('.hero-card-photo-shimmer');

    if (!hero || !shimmer) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
            shimmer.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        },
        { threshold: 0.1 }
    );

    observer.observe(hero);
}
