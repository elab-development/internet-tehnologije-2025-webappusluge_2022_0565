import validator from 'validator';

// Dozvoljeni HTML tagovi za sanitizeHtml
const ALLOWED_TAGS = new Set(['b', 'i', 'em', 'strong', 'p', 'br']);

/**
 * Uklanja nedozvoljene HTML tagove, zadržavajući samo dozvoljene.
 * Uklanja sve atribute sa tagova.
 */
function stripDisallowedTags(html: string, allowedTags: Set<string>): string {
    // Ukloni script/style tagove i njihov sadržaj
    let result = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    result = result.replace(/<style[\s\S]*?<\/style>/gi, '');

    // Ukloni event handler atribute (on*)
    result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

    // Ukloni javascript: URLs
    result = result.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '');
    result = result.replace(/src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '');

    if (allowedTags.size === 0) {
        // Ukloni sve tagove
        return result.replace(/<\/?[^>]+(>|$)/g, '');
    }

    // Zameni nedozvoljene tagove, zadrži dozvoljene (bez atributa)
    return result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g, (match, tagName) => {
        const tag = tagName.toLowerCase();
        if (allowedTags.has(tag)) {
            // Zadrži tag ali ukloni sve atribute
            const isClosing = match.startsWith('</');
            const isSelfClosing = tag === 'br';
            if (isClosing) return `</${tag}>`;
            return isSelfClosing ? `<${tag} />` : `<${tag}>`;
        }
        return ''; // Ukloni nedozvoljeni tag
    });
}

/**
 * Dekodira HTML entitete radi zaštite od dvostrukog enkodiranja
 */
function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
}

/**
 * 🛡 XSS ZAŠTITA
 * Sanitizuje HTML sadržaj i uklanja potencijalno opasne skripte.
 * Koristi lightweight server-kompatibilnu implementaciju (bez jsdom zavisnosti).
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty) return '';

    return stripDisallowedTags(dirty, ALLOWED_TAGS);
}

/**
 * Sanitizuje plain text (uklanja HTML tagove)
 */
export function sanitizeText(text: string): string {
    if (!text) return '';

    // Dekodiraj entitete pa ukloni sve tagove
    const decoded = decodeHtmlEntities(text);
    return stripDisallowedTags(decoded, new Set());
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
