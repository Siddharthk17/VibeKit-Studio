import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { verifyToken, extractTokenFromCookie } from '../lib/auth';
import { query, queryOne } from '../lib/db';

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  const cookie = event.headers.cookie || event.headers.Cookie;
  const token = extractTokenFromCookie(cookie) || event.headers.authorization?.replace('Bearer ', '');

  const decoded = token ? verifyToken(token) : null;
  if (!decoded) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (event.httpMethod === 'GET') {
    const pages = await query(
      `SELECT id, title, slug, theme_id, status, view_count, created_at, updated_at
       FROM pages WHERE user_id = $1 ORDER BY updated_at DESC`,
      [decoded.userId]
    );
    return { statusCode: 200, body: JSON.stringify({ pages }) };
  }

  if (event.httpMethod === 'POST') {
    let body: unknown;
    try { body = JSON.parse(event.body || '{}'); } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { title, theme_id, slug: inputSlug } = body as { title?: string; theme_id?: string; slug?: string };
    const finalTitle = title || 'Untitled Page';
    const baseSlug = inputSlug || finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await queryOne('SELECT id FROM pages WHERE user_id = $1 AND slug = $2', [decoded.userId, slug]);
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const page = await queryOne(
      `INSERT INTO pages (user_id, title, slug, theme_id)
       VALUES ($1, $2, $3, $4) RETURNING id, title, slug, theme_id, status, view_count, created_at, updated_at`,
      [decoded.userId, finalTitle, slug, theme_id || 'minimal']
    );

    return { statusCode: 201, body: JSON.stringify({ page }) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
