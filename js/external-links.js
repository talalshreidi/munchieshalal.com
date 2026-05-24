// Adds noopener on links that open in a new tab (Instagram, Google Maps, etc.).
export function initExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((anchor) => {
        if (!(anchor instanceof HTMLAnchorElement)) {
            return;
        }

        const rel = new Set((anchor.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
        rel.add('noopener');
        rel.add('noreferrer');
        anchor.setAttribute('rel', [...rel].join(' '));

        const expectedHost = anchor.dataset.externalHost?.trim();

        if (!expectedHost) {
            return;
        }

        try {
            const { hostname } = new URL(anchor.href);

            if (hostname !== expectedHost) {
                anchor.removeAttribute('href');
                anchor.setAttribute('aria-disabled', 'true');
            }
        } catch {
            anchor.removeAttribute('href');
            anchor.setAttribute('aria-disabled', 'true');
        }
    });
}
