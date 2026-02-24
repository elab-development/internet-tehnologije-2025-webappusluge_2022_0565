import { registerSchema, loginSchema } from '@/lib/validations/auth';
import { UserRole } from '@prisma/client';

describe('lib/validations/auth', () => {
    describe('registerSchema', () => {
        it('should validate correct registration data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: UserRole.CLIENT,
            };

            const result = registerSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject invalid email', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('email');
            }
        });

        it('should reject short password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '12345',
                firstName: 'John',
                lastName: 'Doe',
            };

            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('password');
            }
        });

        it('should reject short first name', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'J',
                lastName: 'Doe',
            };

            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should validate phone number format', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+381601234567',
            };

            const result = registerSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject invalid phone number', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                phone: '123',
            };

            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('loginSchema', () => {
        it('should validate correct login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
            };

            const result = loginSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject invalid email', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123',
            };

            const result = loginSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject missing password', () => {
            const invalidData = {
                email: 'test@example.com',
            };

            const result = loginSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});