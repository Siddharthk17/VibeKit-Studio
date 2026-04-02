import { Link } from 'react-router-dom';
import { themes } from '../lib/themes';

export function Landing() {
  const showcaseThemes = themes.slice(0, 3);

  return (
    <div>
      {/* Nav */}
      <nav style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>VibeKit Studio</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Log in</Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: 'var(--section-spacing) 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1.5rem' }}>
            Generate a theme, build a mini-site, publish it.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            VibeKit Studio lets you pick a design vibe, customize your page with a live editor, and publish it instantly.
          </p>
          <Link to="/signup" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
            Create your first page
          </Link>
        </div>
      </section>

      {/* Theme Showcase */}
      <section style={{ padding: 'var(--section-spacing) 0', background: 'var(--surface)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}>Choose your vibe</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {showcaseThemes.map(theme => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: 'var(--section-spacing) 0' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎨</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Pick a Vibe</h3>
              <p style={{ color: 'var(--text-muted)' }}>Choose from 6+ curated design presets with unique colors, typography, and spacing.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✏️</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Build Your Page</h3>
              <p style={{ color: 'var(--text-muted)' }}>Edit hero, features, gallery, and contact sections with live preview across devices.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Publish Instantly</h3>
              <p style={{ color: 'var(--text-muted)' }}>Share your page with a unique URL. Track views and collect contact submissions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--section-spacing) 0', textAlign: 'center', background: 'var(--accent)', color: 'var(--bg)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to create?</h2>
          <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Start building your mini-site in minutes.</p>
          <Link to="/signup" className="btn" style={{ background: 'var(--bg)', color: 'var(--accent)', fontSize: '1.125rem', padding: '1rem 2rem' }}>
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="container">
          <p>&copy; 2026 VibeKit Studio. Built for the Full Stack Vibe Coder assessment.</p>
        </div>
      </footer>
    </div>
  );
}

function ThemeCard({ theme }: { theme: any }) {
  return (
    <div
      className="card fade-in"
      style={{
        background: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius,
        boxShadow: theme.shadow,
        overflow: 'hidden',
      }}
    >
      {/* Preview strip */}
      <div style={{
        height: '120px',
        background: theme.colors.background,
        marginBottom: '1.5rem',
        borderRadius: theme.radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${theme.colors.border}`,
      }}>
        <span style={{
          fontFamily: theme.typography.headingFont,
          fontWeight: theme.typography.headingWeight,
          fontSize: '1.5rem',
          color: theme.colors.text,
        }}>
          {theme.name.split('/')[0].trim()}
        </span>
      </div>
      <h3 style={{
        fontFamily: theme.typography.headingFont,
        fontWeight: theme.typography.headingWeight,
        marginBottom: '0.5rem',
        color: theme.colors.text,
      }}>
        {theme.name}
      </h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[theme.colors.background, theme.colors.surface, theme.colors.accent, theme.colors.text].map((c, i) => (
          <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: `1px solid ${theme.colors.border}` }} />
        ))}
      </div>
      <p style={{ color: theme.colors.textMuted, fontSize: '0.875rem' }}>
        {theme.buttonStyle === 'glow' ? 'Glowing buttons with neon effects' :
         theme.buttonStyle === 'brutal' ? 'Bold borders with offset shadows' :
         theme.buttonStyle === 'pixel' ? 'Retro pixel-perfect blocky style' :
         theme.buttonStyle === 'soft' ? 'Soft shadows with rounded corners' :
         theme.buttonStyle === 'outline' ? 'Elegant outlined buttons' :
         'Clean solid buttons with minimal styling'}
      </p>
    </div>
  );
}
