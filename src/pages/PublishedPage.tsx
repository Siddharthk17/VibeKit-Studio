import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { getTheme } from '../lib/themes';
import type { PageContent, ThemePreset } from '../types';

export function PublishedPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [content, setContent] = useState<PageContent | null>(null);
  const [theme, setTheme] = useState<ThemePreset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    try {
      const data = await api.getPublicPage(slug!);
      setPage(data.page);
      setContent(data.page.content);
      setTheme(getTheme(data.page.theme_id));
      await api.trackView(slug!);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!slug || !content) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await api.submitContact(slug, {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        message: formData.get('message') as string,
      });
      setContactSent(true);
      form.reset();
    } catch {
      setError('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '200px', height: '40px' }} />
      </div>
    );
  }

  if (error || !page || !content || !theme) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <h1>Page not found</h1>
        <p style={{ color: 'var(--text-muted)' }}>This page may not exist or is not published.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    );
  }

  const buttonClass = `btn btn-${theme.buttonStyle}`;

  return (
    <div style={{
      '--bg': theme.colors.background,
      '--surface': theme.colors.surface,
      '--text': theme.colors.text,
      '--text-muted': theme.colors.textMuted,
      '--accent': theme.colors.accent,
      '--accent-hover': theme.colors.accentHover,
      '--border': theme.colors.border,
      '--heading-font': theme.typography.headingFont,
      '--body-font': theme.typography.bodyFont,
      '--radius': theme.radius,
      '--shadow': theme.shadow,
      '--section-spacing': theme.spacing.section,
      '--card-spacing': theme.spacing.card,
    } as React.CSSProperties}>
      {/* Hero */}
      <section style={{ padding: 'var(--section-spacing) 2rem', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--heading-font)', fontWeight: theme.typography.headingWeight, fontSize: 'clamp(1.75rem, 4vw, 3rem)', marginBottom: '1rem', color: 'var(--text)' }}>
            {content.hero.title}
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            {content.hero.subtitle}
          </p>
          {content.hero.buttonText && (
            <a href={content.hero.buttonUrl} className={buttonClass} style={{ textDecoration: 'none' }}>
              {content.hero.buttonText}
            </a>
          )}
        </div>
      </section>

      {/* Features */}
      {content.features.length > 0 && (
        <section style={{ padding: 'var(--section-spacing) 2rem', background: 'var(--surface)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {content.features.map((f, i) => (
                <div key={i} className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)', borderRadius: 'var(--radius)', padding: 'var(--card-spacing)', boxShadow: 'var(--shadow)' }}>
                  <h3 style={{ fontFamily: 'var(--heading-font)', fontWeight: theme.typography.headingWeight, marginBottom: '0.5rem', color: 'var(--text)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {content.gallery.length > 0 && (
        <section style={{ padding: 'var(--section-spacing) 2rem' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {content.gallery.map((url, i) => (
                <img key={i} src={url} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius)' }} loading="lazy" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section style={{ padding: 'var(--section-spacing) 2rem', background: 'var(--surface)' }}>
        <div className="container" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--heading-font)', fontWeight: theme.typography.headingWeight, marginBottom: '0.5rem' }}>{content.contact.title}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{content.contact.subtitle}</p>

          {contactSent ? (
            <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
              <p>Message sent successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input name="name" className="input" placeholder="Your name" required style={{ background: 'var(--bg)', borderColor: 'var(--border)' }} />
              <input name="email" type="email" className="input" placeholder="Your email" required style={{ background: 'var(--bg)', borderColor: 'var(--border)' }} />
              <textarea name="message" className="input" placeholder="Your message" rows={4} required style={{ background: 'var(--bg)', borderColor: 'var(--border)', resize: 'vertical' }} />
              <button type="submit" className={buttonClass}>Send Message</button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>Published with VibeKit Studio</p>
      </footer>
    </div>
  );
}
