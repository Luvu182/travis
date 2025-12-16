import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'], // CommonJS for Node.js
  target: 'node20',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: true,
  dts: false, // Skip declaration files for faster builds
  minify: false, // Keep readable for debugging
  treeshake: true,
  // Bundle workspace packages into the output
  noExternal: [
    '@jarvis/config',
    '@jarvis/core',
    '@jarvis/db',
  ],
  // External packages (not bundled)
  external: [
    'pg',
    'pg-native',
    'better-sqlite3',
    'mysql2',
    'tedious',
    'oracledb',
  ],
  // Environment variables replacement
  env: {
    NODE_ENV: 'production',
  },
  // Handle ESM/CJS interop
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
    options.conditions = ['import', 'require'];
  },
});
