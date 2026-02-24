import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'fallback_secret';

export function signToken(payload: object, expiresIn: string = '1h') {
    // @ts-ignore
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET_KEY) as { id: string; email: string; purpose: string };
    } catch (error) {
        return null;
    }
}
