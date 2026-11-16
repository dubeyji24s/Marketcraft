import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const src = (p) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

// `vite build --mode preview` produces a self-contained demo (simulated server and
// sign-in, data kept in the browser) for sharing as a claude.ai artifact.
export default defineConfig(({ mode }) => {
  const preview = mode === 'preview';
  return {
    plugins: [react()],
    base: preview ? './' : '/',
    define: { __PREVIEW__: JSON.stringify(preview) },
    resolve: {
      alias: {
        '@transport': src(preview ? 'preview/transport.js' : 'lib/transport.js'),
        '@auth-provider': src(preview ? 'preview/authProvider.js' : 'lib/authProvider.js'),
        // the free Starter engine is shared with the server
        '@starter': fileURLToPath(new URL('../server/src/ai/starter.js', import.meta.url)),
        // the Partner Guard rules run instantly in the browser too (0 tokens)
        '@guard': fileURLToPath(new URL('../server/src/agents/guard.js', import.meta.url)),
      },
    },
    build: preview ? { chunkSizeWarningLimit: 900, outDir: 'dist-preview', assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false } : { chunkSizeWarningLimit: 900 },
    server: {
      port: 5173,
      proxy: { '/api': 'http://localhost:4000' },
    },
  };
});
