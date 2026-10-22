import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URL de production à confirmer : canonical, OG et sitemap en dépendent.
export default defineConfig({
  site: 'https://scalify.fr',
  trailingSlash: 'always',
  integrations: [sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
});
