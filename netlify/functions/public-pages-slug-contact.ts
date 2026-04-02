import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { z } from 'zod';
import { queryOne } from '../lib/db';

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(2000),
});

function getSlugFromPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 2] || null;
}

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const slug = getSlugFromPath(event.path);
  if (!slug) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Slug required' }) };
  }

  let body: unknown;
  try { body = JSON.parse(event.body || '{}'); } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return { statusCode: 400, body: JSON.stringify({ error: parsed.error.issues[0].message }) };
  }

  const page = await queryOne<{ id: string }>(
    'SELECT id FROM pages WHERE slug = $1 AND status = \'published\'',
    [slug]
  );

  if (!page) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Page not found' }) };
  }

  const submission = await queryOne(
    `INSERT INTO contact_submissions (page_id, name, email, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, message, created_at`,
    [page.id, parsed.data.name, parsed.data.email, parsed.data.message]
  );

  return { statusCode: 201, body: JSON.stringify({ submission }) };
};
