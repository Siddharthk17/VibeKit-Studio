type PageRecord = {
  id: string;
  title: string;
  slug: string;
  theme_id: string;
  status: 'draft' | 'published';
  content: PageContent;
  view_count: number;
  created_at: string;
  updated_at: string;
};

type PageContent = {
  hero: { title: string; subtitle: string; buttonText: string; buttonUrl: string };
  features: { title: string; description: string }[];
  gallery: string[];
  contact: { title: string; subtitle: string };
};

const PAGES_KEY = 'vibekit_pages';

function getPages(): PageRecord[] {
  try {
    const raw = localStorage.getItem(PAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePages(pages: PageRecord[]) {
  localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

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

export const store = {
  getAll: (): PageRecord[] => getPages(),

  getById: (id: string): PageRecord | null => {
    return getPages().find(p => p.id === id) || null;
  },

  getBySlug: (slug: string): PageRecord | null => {
    return getPages().find(p => p.slug === slug && p.status === 'published') || null;
  },

  create: (title?: string, themeId?: string): PageRecord => {
    const pages = getPages();
    const finalTitle = title || 'Untitled Page';
    const baseSlug = finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (pages.find(p => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    const page: PageRecord = {
      id: genId(),
      title: finalTitle,
      slug,
      theme_id: themeId || 'minimal',
      status: 'draft',
      content: { ...defaultContent, hero: { ...defaultContent.hero, title: finalTitle } },
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    pages.unshift(page);
    savePages(pages);
    return page;
  },

  update: (id: string, updates: Partial<PageRecord>): PageRecord | null => {
    const pages = getPages();
    const idx = pages.findIndex(p => p.id === id);
    if (idx === -1) return null;
    pages[idx] = { ...pages[idx], ...updates, updated_at: new Date().toISOString() };
    savePages(pages);
    return pages[idx];
  },

  publish: (id: string): PageRecord | null => {
    return store.update(id, { status: 'published' });
  },

  unpublish: (id: string): PageRecord | null => {
    return store.update(id, { status: 'draft' });
  },

  duplicate: (id: string): PageRecord | null => {
    const pages = getPages();
    const source = pages.find(p => p.id === id);
    if (!source) return null;
    const newSlug = `${source.slug}-copy`;
    let slug = newSlug;
    let counter = 1;
    while (pages.find(p => p.slug === slug)) {
      slug = `${newSlug}-${counter++}`;
    }
    const page: PageRecord = {
      ...source,
      id: genId(),
      title: `${source.title} (Copy)`,
      slug,
      status: 'draft',
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    pages.unshift(page);
    savePages(pages);
    return page;
  },

  delete: (id: string): boolean => {
    const pages = getPages();
    const filtered = pages.filter(p => p.id !== id);
    if (filtered.length === pages.length) return false;
    savePages(filtered);
    return true;
  },

  trackView: (slug: string): boolean => {
    const pages = getPages();
    const page = pages.find(p => p.slug === slug && p.status === 'published');
    if (!page) return false;
    page.view_count++;
    savePages(pages);
    return true;
  },

  submitContact: (slug: string, data: { name: string; email: string; message: string }): boolean => {
    const page = store.getBySlug(slug);
    if (!page) return false;
    const submissions = JSON.parse(localStorage.getItem('vibekit_contacts') || '[]');
    submissions.push({ ...data, page_slug: slug, created_at: new Date().toISOString() });
    localStorage.setItem('vibekit_contacts', JSON.stringify(submissions));
    return true;
  },
};
