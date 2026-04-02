import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { themes, getTheme } from '../lib/themes';
import type { PageContent, ThemePreset } from '../types';

type DeviceView = 'desktop' | 'tablet' | 'mobile';

const defaultContent: PageContent = {
  hero: { title: 'Welcome', subtitle: 'Edit this subtitle to describe your page', buttonText: 'Get Started', buttonUrl: '#' },
  features: [
    { title: 'Feature One', description: 'Describe your first feature here' },
    { title: 'Feature Two', description: 'Describe your second feature here' },
    { title: 'Feature Three', description: 'Describe your third feature here' },
  ],
  gallery: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
  ],
  contact: { title: 'Contact Us', subtitle: 'Get in touch with us' },
};

export function PageBuilder() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [themeId, setThemeId] = useState('minimal');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [device, setDevice] = useState<DeviceView>('desktop');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    if (!id) return;
    loadPage();
  }, [id, user, authLoading]);

  const loadPage = async () => {
    try {
      const data = await api.getPage(id!);
      const page = data.page;
      setTitle(page.title);
      setSlug(page.slug);
      setThemeId(page.theme_id);
      setStatus(page.status);
      setContent(page.content || defaultContent);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const savePage = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setSaved(false);
    try {
      await api.updatePage(id, { title, slug, theme_id: themeId, content });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [id, title, slug, themeId, content]);

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(savePage, 30000);
    return () => clearInterval(interval);
  }, [savePage]);

  const handlePublish = async () => {
    if (!id) return;
    try {
      if (status === 'published') {
        await api.unpublishPage(id);
        setStatus('draft');
      } else {
        await api.publishPage(id);
        setStatus('published');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const theme = getTheme(themeId);

  const updateHero = (field: string, value: string) => {
    setContent(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateFeature = (index: number, field: string, value: string) => {
    setContent(prev => {
      const features = [...prev.features];
      features[index] = { ...features[index], [field]: value };
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    setContent(prev => ({ ...prev, features: [...prev.features, { title: 'New Feature', description: 'Description here' }] }));
  };

  const removeFeature = (index: number) => {
    setContent(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === content.features.length - 1)) return;
    setContent(prev => {
      const features = [...prev.features];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [features[index], features[swapIndex]] = [features[swapIndex], features[index]];
      return { ...prev, features };
    });
  };

  const updateGallery = (index: number, value: string) => {
    setContent(prev => {
      const gallery = [...prev.gallery];
      gallery[index] = value;
      return { ...prev, gallery };
    });
  };

  const addGalleryImage = () => {
    setContent(prev => ({ ...prev, gallery: [...prev.gallery, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop'] }));
  };

  const removeGalleryImage = (index: number) => {
    setContent(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  if (authLoading) return null;
  if (authLoading) return null;
  if (!user) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar Editor */}
      <div style={{ width: '360px', minWidth: '360px', borderRight: '1px solid var(--border)', overflowY: 'auto', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/app" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>&larr; Dashboard</Link>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {saved && <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Saved</span>}
            <button onClick={savePage} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Page Settings */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Page Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Title</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} style={{ fontSize: '0.875rem', padding: '0.5rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Slug</label>
              <input className="input" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} style={{ fontSize: '0.875rem', padding: '0.5rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Theme</label>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setThemePickerOpen(!themePickerOpen)} className="btn btn-outline" style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}>
                  {theme.name}
                  <span>{themePickerOpen ? '\u25B2' : '\u25BC'}</span>
                </button>
                {themePickerOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                    {themes.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemePickerOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: t.id === themeId ? 'var(--border)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[t.colors.background, t.colors.accent, t.colors.text].map((c, i) => (
                            <div key={i} style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, border: '1px solid var(--border)' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.875rem' }}>{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem' }}>Published</span>
              <button onClick={handlePublish}
                style={{ width: '48px', height: '28px', borderRadius: '14px', border: 'none', background: status === 'published' ? '#16a34a' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: status === 'published' ? '23px' : '3px', transition: 'left 0.2s' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {['hero', 'features', 'gallery', 'contact'].map(section => (
            <button key={section} onClick={() => setActiveSection(section)}
              style={{ flex: 1, padding: '0.75rem', border: 'none', borderBottom: activeSection === section ? '2px solid var(--accent)' : '2px solid transparent', background: 'transparent', cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.875rem', fontWeight: activeSection === section ? 600 : 400 }}>
              {section}
            </button>
          ))}
        </div>

        {/* Section Editor */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.5rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

          {activeSection === 'hero' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Field label="Title" value={content.hero.title} onChange={v => updateHero('title', v)} />
              <Field label="Subtitle" value={content.hero.subtitle} onChange={v => updateHero('subtitle', v)} />
              <Field label="Button Text" value={content.hero.buttonText} onChange={v => updateHero('buttonText', v)} />
              <Field label="Button URL" value={content.hero.buttonUrl} onChange={v => updateHero('buttonUrl', v)} />
            </div>
          )}

          {activeSection === 'features' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {content.features.map((feature, i) => (
                <div key={i} className="card" style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Card {i + 1}</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => moveFeature(i, 'up')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>&#x25B2;</button>
                      <button onClick={() => moveFeature(i, 'down')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>&#x25BC;</button>
                      <button onClick={() => removeFeature(i)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius)' }}>&#x2715;</button>
                    </div>
                  </div>
                  <Field label="Title" value={feature.title} onChange={v => updateFeature(i, 'title', v)} />
                  <Field label="Description" value={feature.description} onChange={v => updateFeature(i, 'description', v)} />
                </div>
              ))}
              <button onClick={addFeature} className="btn btn-outline" style={{ width: '100%', fontSize: '0.875rem' }}>+ Add Feature Card</button>
            </div>
          )}

          {activeSection === 'gallery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {content.gallery.map((url, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Field label={`Image ${i + 1}`} value={url} onChange={v => updateGallery(i, v)} />
                  <button onClick={() => removeGalleryImage(i)} style={{ padding: '0.5rem', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius)', minHeight: '44px', minWidth: '44px' }}>&#x2715;</button>
                </div>
              ))}
              <button onClick={addGalleryImage} className="btn btn-outline" style={{ width: '100%', fontSize: '0.875rem' }}>+ Add Image</button>
            </div>
          )}

          {activeSection === 'contact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Field label="Title" value={content.contact.title} onChange={v => setContent(prev => ({ ...prev, contact: { ...prev.contact, title: v } }))} />
              <Field label="Subtitle" value={content.contact.subtitle} onChange={v => setContent(prev => ({ ...prev, contact: { ...prev.contact, subtitle: v } }))} />
            </div>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f3f4f6' }}>
        {/* Device Toggle */}
        <div style={{ padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          {([['desktop', '\uD83D\uDDA5 Desktop'], ['tablet', '\uD83D\uDCF1 Tablet'], ['mobile', '\uD83D\uDCF2 Mobile']] as [DeviceView, string][]).map(([d, label]) => (
            <button key={d} onClick={() => setDevice(d)}
              style={{ padding: '0.5rem 1rem', border: device === d ? '2px solid var(--accent)' : '2px solid var(--border)', borderRadius: 'var(--radius)', background: device === d ? 'var(--accent)' : 'var(--surface)', color: device === d ? 'var(--bg)' : 'var(--text)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: device === d ? 600 : 400, minHeight: '44px' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Preview Frame */}
        <div style={{ flex: 1, overflow: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div className={`preview-${device}`} style={{ background: theme.colors.background, minHeight: '100%', borderRadius: device !== 'desktop' ? '16px' : '0', boxShadow: device !== 'desktop' ? '0 0 0 1px rgba(0,0,0,0.1)' : 'none', transition: 'max-width 0.3s ease' }}>
            <PreviewPage content={content} theme={theme} slug={slug} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>{label}</label>
      <input className="input" value={value} onChange={e => onChange(e.target.value)} style={{ fontSize: '0.875rem', padding: '0.5rem' }} />
    </div>
  );
}

function PreviewPage({ content, theme }: { content: PageContent; theme: ThemePreset; slug?: string }) {
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
        <h1 style={{ fontFamily: 'var(--heading-font)', fontWeight: theme.typography.headingWeight, fontSize: 'clamp(1.75rem, 4vw, 3rem)', marginBottom: '1rem', color: 'var(--text)' }}>
          {content.hero.title || 'Your Title'}
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          {content.hero.subtitle}
        </p>
        {content.hero.buttonText && (
          <a href={content.hero.buttonUrl} className={buttonClass} style={{ textDecoration: 'none' }}>
            {content.hero.buttonText}
          </a>
        )}
      </section>

      {/* Features */}
      {content.features.length > 0 && (
        <section style={{ padding: 'var(--section-spacing) 2rem', background: 'var(--surface)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {content.features.map((f, i) => (
              <div key={i} className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)', borderRadius: 'var(--radius)', padding: 'var(--card-spacing)', boxShadow: 'var(--shadow)' }}>
                <h3 style={{ fontFamily: 'var(--heading-font)', fontWeight: theme.typography.headingWeight, marginBottom: '0.5rem', color: 'var(--text)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {content.gallery.length > 0 && (
        <section style={{ padding: 'var(--section-spacing) 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {content.gallery.map((url, i) => (
              <img key={i} src={url} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section style={{ padding: 'var(--section-spacing) 2rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--heading-font)', fontWeight: theme.typography.headingWeight, marginBottom: '0.5rem' }}>{content.contact.title}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{content.contact.subtitle}</p>
          <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input className="input" placeholder="Your name" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }} />
            <input className="input" type="email" placeholder="Your email" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }} />
            <textarea className="input" placeholder="Your message" rows={4} style={{ background: 'var(--bg)', borderColor: 'var(--border)', resize: 'vertical' }} />
            <button type="submit" className={buttonClass}>Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
}
