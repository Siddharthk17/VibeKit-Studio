import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { queryOne, query } from '../lib/db';
import { generateToken } from '../lib/auth';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return { statusCode: 400, body: JSON.stringify({ error: parsed.error.issues[0].message }) };
  }

  const { email, password } = parsed.data;

  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existing) {
    return { statusCode: 409, body: JSON.stringify({ error: 'Email already registered' }) };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await queryOne<{ id: string; email: string }>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, passwordHash]
  );

  if (!user) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to create user' }) };
  }

  const token = generateToken(user.id, user.email);

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
    },
    body: JSON.stringify({ user: { id: user.id, email: user.email }, token }),
  };
};
