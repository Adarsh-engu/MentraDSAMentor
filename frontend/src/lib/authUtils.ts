import { SignJWT } from 'jose';

export async function generateApiToken(userId: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not defined');
  }

  const secretKey = new TextEncoder().encode(secret);

  // Create a JWT that expires in 1 hour
  return await new SignJWT({ user_id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretKey);
}
