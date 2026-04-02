import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { verifyToken, extractTokenFromCookie } from '../lib/auth';
import { queryOne } from '../lib/db';

function getIdFromPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || null;
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
    `SELECT id, title, slug, theme_id, status, content, view_count, created_at, updated_at
     FROM pages WHERE id = $1 AND user_id = $2`,
    [id, decoded.userId]
  );

  if (!page) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Page not found' }) };
  }

  if (event.httpMethod === 'GET') {
    return { statusCode: 200, body: JSON.stringify({ page }) };
  }

  if (event.httpMethod === 'PUT') {
    let body: unknown;
    try { body = JSON.parse(event.body || '{}'); } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { title, theme_id, content, slug: inputSlug } = body as {
      title?: string; theme_id?: string; content?: any; slug?: string;
    };

    let slug = page.slug;
    if (inputSlug && inputSlug !== page.slug) {
      const baseSlug = inputSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let finalSlug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await queryOne(
          'SELECT id FROM pages WHERE user_id = $1 AND slug = $2 AND id != $3',
          [decoded.userId, finalSlug, id]
        );
        if (!existing) break;
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      slug = finalSlug;
    }

    const updated = await queryOne(
      `UPDATE pages SET title = COALESCE($1, title), theme_id = COALESCE($2, theme_id),
       content = COALESCE($3, content), slug = COALESCE($4, slug),
       updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING id, title, slug, theme_id, status, content, view_count, created_at, updated_at`,
      [title, theme_id, content ? JSON.stringify(content) : null, slug, id, decoded.userId]
    );

    return { statusCode: 200, body: JSON.stringify({ page: updated }) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
