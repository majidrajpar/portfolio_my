// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const isCloudflare = Boolean(process.env.CF_PAGES);
const site = isCloudflare ? (process.env.CF_PAGES_URL || 'https://majidrajpar.pages.dev') : 'https://majidrajpar.github.io';
const base = isCloudflare ? '/' : '/portfolio_my';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['@observablehq/plot']
    }
  },

  build: {
    inlineStylesheets: 'auto'
  },

  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/projects/category/'),
    }),
  ]
});