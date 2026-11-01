import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        search: 'search.html',
        designs: 'designs.html',
        collaboration: 'collaboration.html',
        about: 'about.html',
        privacy: 'privacy.html',
      },
    },
  },
});
