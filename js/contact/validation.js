// Rules for name, email, and message before we send the form.

export const LIMITS = {
    name: { min: 2, max: 80 },
    email: { max: 254 },
    message: { min: 10, max: 2000 },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeText(value, maxLength) {
    const cleaned = String(value ?? '')
        .replace(/[\0-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .trim();

    if (cleaned.length > maxLength) {
        return cleaned.slice(0, maxLength);
    }

    return cleaned;
}

export function sanitizeEmail(value) {
    return sanitizeText(value, LIMITS.email.max).toLowerCase();
}

export function validateContactFields(fields) {
    const errors = {};

    const name = sanitizeText(fields.name, LIMITS.name.max);
    const email = sanitizeEmail(fields.email);
    const message = sanitizeText(fields.message, LIMITS.message.max);

    if (name.length < LIMITS.name.min) {
        errors.name = `Name must be at least ${LIMITS.name.min} characters.`;
    }

    if (!email) {
        errors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email.max) {
        errors.email = 'Please enter a valid email address.';
    }

    if (message.length < LIMITS.message.min) {
        errors.message = `Message must be at least ${LIMITS.message.min} characters.`;
    }

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
    }

    return {
        ok: true,
        data: { name, email, message },
    };
}
