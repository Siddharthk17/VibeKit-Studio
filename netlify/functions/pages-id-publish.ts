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

  const page = await queryOne(
    'SELECT id, user_id FROM pages WHERE id = $1 AND user_id = $2',
    [id, decoded.userId]
  );

  if (!page) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Page not found' }) };
  }

  const newStatus = event.path.includes('/publish') ? 'published' : 'draft';

  const updated = await queryOne(
    `UPDATE pages SET status = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING id, title, slug, theme_id, status, view_count, created_at, updated_at`,
    [newStatus, id, decoded.userId]
  );

  return { statusCode: 200, body: JSON.stringify({ page: updated }) };
};
