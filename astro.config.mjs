// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kendesk.tikendo.com.mx',
  integrations: [sitemap()],
  // Astro 7 cambió el default a 'jsx', que elimina espacios entre elementos inline
  // (p. ej. "correo a<a>ventas@...</a>"). Mantenemos el comportamiento de Astro 6.
  compressHTML: true,
});
