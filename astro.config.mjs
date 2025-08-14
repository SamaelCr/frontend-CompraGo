// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',               // SSR activado
  adapter: node({
    mode: 'standalone',           // genera un único servidor
  }),
  integrations: [
    tailwind(),                   // integración de Tailwind CSS
  ],
});