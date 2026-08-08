import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SignJWT } from 'jose';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      throw new Error('AUTH_SECRET is not defined');
    }

    const secretKey = new TextEncoder().encode(secret);

    // Create a JWT that expires in 1 hour
    const token = await new SignJWT({ user_id: session.user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secretKey);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
