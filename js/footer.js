// Auto-updates the © year in the footer.
export function initFooter() {
    const yearEl = document.getElementById('footerYear');

    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }
    console.log('Footer initialized');
}
