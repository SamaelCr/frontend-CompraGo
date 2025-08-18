import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react'; // <-- AÑADIR ESTA LÍNEA

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    tailwind(),
    react(), // <-- AÑADIR ESTA LÍNEA
  ],
});