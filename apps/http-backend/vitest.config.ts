import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
  resolve: {
    alias: {
      '@repo/db': path.resolve(__dirname, '../../packages/db/src'),
      '@repo/types': path.resolve(__dirname, '../../packages/types/src')
    }
  }
});
