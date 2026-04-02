import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { verifyToken, extractTokenFromCookie } from '../lib/auth';
import { queryOne } from '../lib/db';

function getIdFromPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 2] || null;
}

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  const cookie = event.headers.cookie || event.headers.Cookie;
  const token = extractTokenFromCookie(cookie) || event.headers.authorization?.replace('Bearer ', '');

  const decoded = token ? verifyToken(token) : null;
  if (!decoded) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const id = getIdFromPath(event.path);
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Page ID required' }) };
  }

  const source = await queryOne(
    'SELECT * FROM pages WHERE id = $1 AND user_id = $2',
    [id, decoded.userId]
  );

  if (!source) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Page not found' }) };
  }

  const newSlug = `${source.slug}-copy`;
  let finalSlug = newSlug;
  let counter = 1;
  while (true) {
    const existing = await queryOne(
      'SELECT id FROM pages WHERE user_id = $1 AND slug = $2',
      [decoded.userId, finalSlug]
    );
    if (!existing) break;
    finalSlug = `${newSlug}-${counter}`;
    counter++;
  }

  const page = await queryOne(
    `INSERT INTO pages (user_id, title, slug, theme_id, content)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, slug, theme_id, status, view_count, created_at, updated_at`,
    [decoded.userId, `${source.title} (Copy)`, finalSlug, source.theme_id, source.content]
  );

  return { statusCode: 201, body: JSON.stringify({ page }) };
};
