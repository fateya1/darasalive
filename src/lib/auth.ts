import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: { userId: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret());
  return payload as { userId: string; role: string };
}

// TODO Phase 2: wire this into middleware.ts to protect /admin and gated routes,
// and into a getCurrentUser() helper used by server components.
