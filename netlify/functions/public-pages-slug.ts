import { HandlerEvent, HandlerContext } from '@netlify/functions';
import { queryOne, query } from '../lib/db';

function getSlugFromPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || null;
}

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  const slug = getSlugFromPath(event.path);
  if (!slug) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Slug required' }) };
  }

  if (event.httpMethod === 'GET') {
    const page = await queryOne(
      `SELECT id, title, slug, theme_id, status, content, view_count, created_at, updated_at
       FROM pages WHERE slug = $1 AND status = 'published'`,
      [slug]
    );

    if (!page) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Page not found' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ page }) };
  }

  if (event.httpMethod === 'POST') {
    await query(
      'UPDATE pages SET view_count = view_count + 1 WHERE slug = $1',
      [slug]
    );

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
