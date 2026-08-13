import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://freefiletools.com',
  output: 'static',
  integrations: [sitemap()],
  devToolbar: {
    enabled: false,
  },
  server: {
    port: 4321,
    host: true,
  },
  build: {
    assets: '_assets',
  },
});
