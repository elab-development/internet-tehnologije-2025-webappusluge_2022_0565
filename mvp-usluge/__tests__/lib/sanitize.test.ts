import {
    sanitizeHtml,
    sanitizeText,
    validateUUID,
    validateEmail,
    validateURL,
    containsSQLInjection,
    sanitizePath,
} from '@/lib/sanitize';

describe('lib/sanitize', () => {
    describe('sanitizeHtml', () => {
        it('should allow safe HTML tags', () => {
            const input = '<p>Hello <strong>world</strong></p>';
            const output = sanitizeHtml(input);
            expect(output).toContain('<p>');
            expect(output).toContain('<strong>');
        });

        it('should remove script tags (XSS protection)', () => {
            const input = '<p>Hello</p><script>alert("XSS")</script>';
            const output = sanitizeHtml(input);
            expect(output).not.toContain('<script>');
            expect(output).not.toContain('alert');
        });

        it('should remove event handlers', () => {
            const input = '<p onclick="alert(\'XSS\')">Click me</p>';
            const output = sanitizeHtml(input);
            expect(output).not.toContain('onclick');
        });

        it('should handle empty input', () => {
            expect(sanitizeHtml('')).toBe('');
        });
    });

    describe('sanitizeText', () => {
        it('should remove all HTML tags', () => {
            const input = '<p>Hello <strong>world</strong></p>';
            const output = sanitizeText(input);
            expect(output).toBe('Hello world');
        });

        it('should remove script tags', () => {
            const input = 'Hello<script>alert("XSS")</script>world';
            const output = sanitizeText(input);
            expect(output).not.toContain('<script>');
        });
    });

    describe('validateUUID', () => {
        it('should validate correct UUIDs', () => {
            expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
            expect(validateUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
        });

        it('should reject invalid UUIDs', () => {
            expect(validateUUID('invalid-uuid')).toBe(false);
            expect(validateUUID('123')).toBe(false);
            expect(validateUUID('')).toBe(false);
        });
    });

    describe('validateEmail', () => {
        it('should validate correct emails', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
        });

        it('should reject invalid emails', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
        });
    });

    describe('validateURL', () => {
        it('should validate correct URLs', () => {
            expect(validateURL('https://example.com')).toBe(true);
            expect(validateURL('http://localhost:3000')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(validateURL('not-a-url')).toBe(false);
            expect(validateURL('ftp://example.com')).toBe(false); // Only http/https allowed
        });
    });

    describe('containsSQLInjection', () => {
        it('should detect SQL injection attempts', () => {
            expect(containsSQLInjection("' OR 1=1--")).toBe(true);
            expect(containsSQLInjection('SELECT * FROM users')).toBe(true);
            expect(containsSQLInjection('DROP TABLE users')).toBe(true);
            expect(containsSQLInjection("admin'--")).toBe(true);
        });

        it('should not flag normal text', () => {
            expect(containsSQLInjection('Hello world')).toBe(false);
            expect(containsSQLInjection('test@example.com')).toBe(false);
        });
    });

    describe('sanitizePath', () => {
        it('should remove path traversal attempts', () => {
            expect(sanitizePath('../../../etc/passwd')).toBe('etc/passwd');
            expect(sanitizePath('..\\..\\windows\\system32')).toBe('windows\\system32');
        });

        it('should keep normal paths', () => {
            expect(sanitizePath('uploads/images/photo.jpg')).toBe('uploads/images/photo.jpg');
        });
    });
});
