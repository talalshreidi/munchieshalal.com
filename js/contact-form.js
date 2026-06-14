// Contact form — checks fields, blocks spam, sends through Web3Forms.
import { showToast } from './toast.js';
import { validateContactFields } from './contact/validation.js';

const RATE_LIMIT_MS = 60_000;
const RATE_LIMIT_KEY = 'munchies_contact_last_submit';

export function initContactForm(toastEl) {
    const form = document.getElementById('contactForm');

    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    const statusEl = document.getElementById('contactFormStatus');
    const submitBtn = form.querySelector('[type="submit"]');
    const honeypot = form.querySelector('[data-honeypot]');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFieldErrors(form);

        // Bots often fill hidden fields; real users never see this.
        if (honeypot instanceof HTMLInputElement && honeypot.value.trim() !== '') {
            return;
        }

        if (isRateLimited()) {
            setFormStatus(statusEl, 'Please wait a moment before sending another message.');
            showToast(toastEl, 'Please wait a moment before sending again.');
            return;
        }

        const result = validateContactFields({
            name: getFieldValue(form, 'name'),
            email: getFieldValue(form, 'email'),
            message: getFieldValue(form, 'message'),
        });

        if (!result.ok) {
            applyFieldErrors(form, result.errors);
            const firstError = Object.values(result.errors)[0];
            setFormStatus(statusEl, firstError ?? 'Please fix the highlighted fields.');
            showToast(toastEl, firstError ?? 'Please fix the highlighted fields.');
            focusFirstInvalidField(form);
            return;
        }

        setSubmitting(form, submitBtn, true);
        setFormStatus(statusEl, 'Sending your message…');

        try {
            const endpoint = form.dataset.endpoint?.trim();
            const accessKey = form.dataset.accessKey?.trim();

            if (!endpoint) {
                throw new Error('Contact form is not configured.');
            }

            await submitToEndpoint(endpoint, result.data, accessKey);

            markRateLimited();
            form.reset();
            clearFieldErrors(form);
            setFormStatus(statusEl, 'Message sent. We will get back to you soon.');
            showToast(toastEl, `Thanks, ${result.data.name}! We will get back to you soon.`);
        } catch {
            setFormStatus(statusEl, 'Something went wrong. Please call us or try again later.');
            showToast(toastEl, 'Could not send your message. Please call (860) 216-2950.');
        } finally {
            setSubmitting(form, submitBtn, false);
            console.log('Form submission completed');
        }
    });

    form.addEventListener('input', (event) => {
        const target = event.target;

        if (!(target instanceof HTMLElement)) {
            return;
        }

        const field = target.closest('.contact-form__field');

        if (field) {
            field.classList.remove('contact-form__field--error');
            const errorEl = field.querySelector('.contact-form__error');

            if (errorEl) {
                errorEl.textContent = '';
            }
        }
    });
}

async function submitToEndpoint(endpoint, data, accessKey) {
    if (!/^https:\/\//i.test(endpoint)) {
        throw new Error('Invalid form endpoint');
    }

    const isWeb3Forms = endpoint.includes('web3forms.com');

    if (isWeb3Forms && !accessKey) {
        throw new Error('Missing Web3Forms access key');
    }

    const payload = isWeb3Forms
        ? {
              access_key: accessKey,
              name: data.name,
              email: data.email,
              message: data.message,
              subject: `Munchies website — message from ${data.name}`,
          }
        : {
              name: data.name,
              email: data.email,
              message: data.message,
          };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
    });

    let result = null;

    try {
        result = await response.json();
    } catch {
        result = null;
    }

    if (!response.ok || (result && result.success === false)) {
        throw new Error(`Form submission failed: ${response.status}`);
    }
}

function getFieldValue(form, name) {
    const field = form.elements.namedItem(name);

    if (field instanceof RadioNodeList) {
        return String(field.value ?? '');
    }

    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        return field.value;
    }

    return '';
}

function applyFieldErrors(form, errors) {
    for (const [name, message] of Object.entries(errors)) {
        const field = form.querySelector(`.contact-form__field[data-field="${name}"]`);

        if (!(field instanceof HTMLElement)) {
            continue;
        }

        field.classList.add('contact-form__field--error');
        const errorEl = field.querySelector('.contact-form__error');
        const input = field.querySelector('input, textarea');

        if (errorEl) {
            errorEl.textContent = message;
        }

        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
            input.setAttribute('aria-invalid', 'true');

            if (errorEl?.id) {
                input.setAttribute('aria-describedby', errorEl.id);
            }
        }
    }
}

function clearFieldErrors(form) {
    form.querySelectorAll('.contact-form__field--error').forEach((field) => {
        field.classList.remove('contact-form__field--error');
        const errorEl = field.querySelector('.contact-form__error');

        if (errorEl) {
            errorEl.textContent = '';
        }

        const input = field.querySelector('input, textarea');

        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');
        }
    });
}

function focusFirstInvalidField(form) {
    const invalid = form.querySelector('[aria-invalid="true"]');

    if (invalid instanceof HTMLElement) {
        invalid.focus();
    }
}

function setFormStatus(statusEl, message) {
    if (statusEl) {
        statusEl.textContent = message;
    }
}

function setSubmitting(form, submitBtn, isSubmitting) {
    form.setAttribute('aria-busy', String(isSubmitting));

    if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = isSubmitting;
    }
}

function isRateLimited() {
    try {
        const last = Number(sessionStorage.getItem(RATE_LIMIT_KEY));

        if (!Number.isFinite(last)) {
            return false;
        }

        return Date.now() - last < RATE_LIMIT_MS;
    } catch {
        return false;
    }
}

function markRateLimited() {
    try {
        sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
    } catch {
        // Private browsing can block sessionStorage — that's fine.
    }
}
