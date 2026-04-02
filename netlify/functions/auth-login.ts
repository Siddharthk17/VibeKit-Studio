import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { queryOne } from '../lib/db';
import { generateToken } from '../lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return { statusCode: 400, body: JSON.stringify({ error: parsed.error.issues[0].message }) };
  }

  const { email, password } = parsed.data;

  const user = await queryOne<{ id: string; email: string; password_hash: string }>(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email]
  );

  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
  }

  const token = generateToken(user.id, user.email);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
    },
    body: JSON.stringify({ user: { id: user.id, email: user.email }, token }),
  };
};
