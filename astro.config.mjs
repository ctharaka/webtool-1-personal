import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://freefiletools.pages.dev',
  output: 'static',
  integrations: [
    sitemap(),
    tailwind()
  ],
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
