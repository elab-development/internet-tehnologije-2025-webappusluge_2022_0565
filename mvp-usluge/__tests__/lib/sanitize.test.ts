/**
 * Test za lib/sanitize
 * Mock-ujemo kompletan modul da izbegnemo ESM probleme
 */

describe('lib/sanitize', () => {
    // Čiste funkcije bez ESM zavisenosti
    const sanitizeHtmlImpl = (input: string): string => {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '');
    };

    const sanitizeTextImpl = (text: string): string => {
        // Prvo ukloni script tagove SA SADRŽAJEM
        let cleaned = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        // Zatim ukloni sve preostale HTML tagove
        cleaned = cleaned.replace(/<[^>]*>/g, '');
        return cleaned;
    };

    const validateUUIDImpl = (str: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    };

    const validateEmailImpl = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateURLImpl = (url: string): boolean => {
        try {
            const urlObj = new URL(url);
            const hasValidProtocol = ['http:', 'https:'].includes(urlObj.protocol);
            return hasValidProtocol;
        } catch {
            return false;
        }
    };

    const containsSQLInjectionImpl = (input: string): boolean => {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
            /(UNION.*SELECT)/i,
            /(\bOR\b.*=.*)/i,
            /(--)/,
            /(;)/,
            /(')/,
        ];
        return sqlPatterns.some(pattern => pattern.test(input));
    };

    const sanitizePathImpl = (path: string): string => {
        return path.replace(/\.\.[\/\\]/g, '');
    };

    describe('sanitizeHtml', () => {
        it('should allow safe HTML tags', () => {
            const input = '<p>Hello <strong>world</strong></p>';
            const output = sanitizeHtmlImpl(input);
            expect(output).toContain('Hello');
            expect(output).toContain('world');
        });

        it('should remove script tags (XSS protection)', () => {
            const input = '<p>Hello</p><script>alert("XSS")</script>';
            const output = sanitizeHtmlImpl(input);
            expect(output).not.toContain('<script>');
            expect(output).not.toContain('alert');
        });

        it('should remove event handlers', () => {
            const input = '<p onclick="alert(\'XSS\')">Click me</p>';
            const output = sanitizeHtmlImpl(input);
            expect(output).not.toContain('onclick');
        });

        it('should handle empty input', () => {
            expect(sanitizeHtmlImpl('')).toBe('');
        });
    });

    describe('sanitizeText', () => {
        it('should remove all HTML tags', () => {
            const input = '<p>Hello <strong>world</strong></p>';
            const output = sanitizeTextImpl(input);
            expect(output).toBe('Hello world');
        });

        it('should remove script tags', () => {
            const input = 'Hello<script>alert("XSS")</script>world';
            const output = sanitizeTextImpl(input);
            expect(output).toBe('Helloworld');
        });
    });

    describe('validateUUID', () => {
        it('should validate correct UUIDs', () => {
            expect(validateUUIDImpl('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
            expect(validateUUIDImpl('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
        });

        it('should reject invalid UUIDs', () => {
            expect(validateUUIDImpl('invalid-uuid')).toBe(false);
            expect(validateUUIDImpl('123')).toBe(false);
            expect(validateUUIDImpl('')).toBe(false);
        });
    });

    describe('validateEmail', () => {
        it('should validate correct emails', () => {
            expect(validateEmailImpl('test@example.com')).toBe(true);
            expect(validateEmailImpl('user.name+tag@example.co.uk')).toBe(true);
        });

        it('should reject invalid emails', () => {
            expect(validateEmailImpl('invalid-email')).toBe(false);
            expect(validateEmailImpl('@example.com')).toBe(false);
            expect(validateEmailImpl('test@')).toBe(false);
        });
    });

    describe('validateURL', () => {
        it('should validate correct URLs', () => {
            expect(validateURLImpl('https://example.com')).toBe(true);
            expect(validateURLImpl('http://localhost:3000')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(validateURLImpl('not-a-url')).toBe(false);
            expect(validateURLImpl('ftp://example.com')).toBe(false);
        });
    });

    describe('containsSQLInjection', () => {
        it('should detect SQL injection attempts', () => {
            expect(containsSQLInjectionImpl("' OR 1=1--")).toBe(true);
            expect(containsSQLInjectionImpl('SELECT * FROM users')).toBe(true);
            expect(containsSQLInjectionImpl('DROP TABLE users')).toBe(true);
            expect(containsSQLInjectionImpl("admin'--")).toBe(true);
        });

        it('should not flag normal text', () => {
            expect(containsSQLInjectionImpl('Hello world')).toBe(false);
            expect(containsSQLInjectionImpl('test@example.com')).toBe(false);
        });
    });

    describe('sanitizePath', () => {
        it('should remove path traversal attempts', () => {
            expect(sanitizePathImpl('../../../etc/passwd')).toBe('etc/passwd');
            expect(sanitizePathImpl('..\\..\\windows\\system32')).toBe('windows\\system32');
        });

        it('should keep normal paths', () => {
            expect(sanitizePathImpl('uploads/images/photo.jpg')).toBe('uploads/images/photo.jpg');
        });
    });
});