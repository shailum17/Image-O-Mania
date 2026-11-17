import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        // Root
        main:          'index.html',
        // Pages subfolder — all real pages live here
        search:        'pages/Search.html',
        designs:       'pages/my_designs.html',
        collaboration: 'pages/collaboration.html',
        about:         'pages/about.html',
        admin:         'pages/admin.html',
        contact:       'pages/contact.html',
        privacy:       'pages/privacy.html',
      },
    },
  },
});
