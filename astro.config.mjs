import { defineConfig } from 'astro/config';

// For GitHub Pages at https://<user>.github.io/portfolio set BASE_PATH=/portfolio.
// With a custom domain, leave BASE_PATH unset.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
});
