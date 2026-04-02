import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function Dashboard() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = () => {
    try {
      const data = api.getPages();
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    try {
      const data = api.createPage('My New Page');
      navigate(`/app/edit/${data.page.id}`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDuplicate = (page: any) => {
    try {
      api.duplicatePage(page.id);
      loadPages();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this page?')) return;
    try {
      api.deletePage(id);
      loadPages();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div>
      <nav style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 700, fontSize: '1.25rem' }}>VibeKit Studio</Link>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Guest Mode</span>
        </div>
      </nav>

      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem' }}>Your Pages</h1>
          <button onClick={handleCreate} className="btn btn-primary">Create new page</button>
        </div>

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
                  <button onClick={() => handleDuplicate(page)} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Duplicate</button>
                  {page.status === 'published' && (
                    <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>View</a>
                  )}
                  <button onClick={() => handleDelete(page.id)} className="btn" style={{ padding: '0.5rem 1rem', color: '#dc2626', border: '1px solid #fecaca', background: '#fef2f2' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
