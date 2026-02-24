import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * 🛡 XSS ZAŠTITA
 * Sanitizuje HTML sadržaj i uklanja potencijalno opasne skripte
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty) return '';

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: [],
    });
}

/**
 * Sanitizuje plain text (uklanja HTML tagove)
 */
export function sanitizeText(text: string): string {
    if (!text) return '';

    return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
}

/**
 * 🛡 SQL INJECTION ZAŠTITA
 * Dodatna validacija uz Prisma ORM
 */
export function validateUUID(uuid: string): boolean {
    return validator.isUUID(uuid);
}

export function validateEmail(email: string): boolean {
    return validator.isEmail(email);
}

export function validateURL(url: string): boolean {
    return validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true,
    });
}

/**
 * Escape special characters za SQL upite (dodatna zaštita)
 */
export function escapeSQLString(str: string): string {
    if (!str) return '';

    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\x00/g, '\\0')
        .replace(/\x1a/g, '\\Z');
}

/**
 * Validacija da string ne sadrži SQL ključne reči
 */
export function containsSQLInjection(str: string): boolean {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(--|;|\/\*|\*\/|xp_|sp_)/i,
        /(\bOR\b.*=.*|1=1|'=')/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(str));
}

/**
 * 🛡 PATH TRAVERSAL ZAŠTITA
 */
export function sanitizePath(path: string): string {
    if (!path) return '';

    // Ukloni ../ i ..\
    return path.replace(/\.\.[\/\\]/g, '');
}

/**
 * 🛡 COMMAND INJECTION ZAŠTITA
 */
export function sanitizeCommand(cmd: string): string {
    if (!cmd) return '';

    // Ukloni opasne karaktere
    return cmd.replace(/[;&|`$()]/g, '');
}
