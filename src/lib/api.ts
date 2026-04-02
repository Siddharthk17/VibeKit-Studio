import { store } from './store';

export const api = {
  getPages: () => ({ pages: store.getAll() }),

  createPage: (title?: string, themeId?: string) => ({ page: store.create(title, themeId) }),

  getPage: (id: string) => {
    const page = store.getById(id);
    if (!page) throw new Error('Page not found');
    return { page };
  },

  updatePage: (id: string, data: { title?: string; theme_id?: string; content?: any; slug?: string }) => {
    const page = store.update(id, data as any);
    if (!page) throw new Error('Page not found');
    return { page };
  },

  publishPage: (id: string) => {
    const page = store.publish(id);
    if (!page) throw new Error('Page not found');
    return { page };
  },

  unpublishPage: (id: string) => {
    const page = store.unpublish(id);
    if (!page) throw new Error('Page not found');
    return { page };
  },

  duplicatePage: (id: string) => {
    const page = store.duplicate(id);
    if (!page) throw new Error('Page not found');
    return { page };
  },

  deletePage: (id: string) => {
    if (!store.delete(id)) throw new Error('Page not found');
    return { success: true };
  },

  getPublicPage: (slug: string) => {
    const page = store.getBySlug(slug);
    if (!page) throw new Error('Page not found');
    return { page };
  },

  trackView: (slug: string) => {
    store.trackView(slug);
    return { success: true };
  },

  submitContact: (slug: string, data: { name: string; email: string; message: string }) => {
    if (!store.submitContact(slug, data)) throw new Error('Page not found');
    return { submission: { ...data, created_at: new Date().toISOString() } };
  },
};
