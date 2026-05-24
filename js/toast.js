// Small popup message after form submit (success or error).
export function showToast(toastEl, message) {
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.classList.add('show');

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}
