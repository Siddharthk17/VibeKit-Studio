import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const data = await api.getPages();
      setPages(data.pages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const data = await api.createPage('My New Page');
      navigate(`/app/edit/${data.page.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicatePage(id);
      loadPages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (authLoading) return null;
  if (authLoading) return null;
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div>
      {/* Nav */}
      <nav style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: '1.25rem' }}>VibeKit Studio</Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email}</span>
            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Log out</button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem' }}>Your Pages</h1>
          <button onClick={handleCreate} className="btn btn-primary">Create new page</button>
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid #fecaca' }}>{error}</div>}

        {loading ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '80px' }} />)}
          </div>
        ) : pages.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No pages yet. Create your first one!</p>
            <button onClick={handleCreate} className="btn btn-primary">Create your first page</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pages.map(page => (
              <div key={page.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{page.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span>/p/{page.slug}</span>
                    <span>{page.view_count} views</span>
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      borderRadius: '999px',
                      background: page.status === 'published' ? '#dcfce7' : '#fef3c7',
                      color: page.status === 'published' ? '#166534' : '#854d0e',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {page.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/app/edit/${page.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Edit</Link>
                  <button onClick={() => handleDuplicate(page.id)} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} title="Duplicate">Duplicate</button>
                  {page.status === 'published' && (
                    <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>View</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
