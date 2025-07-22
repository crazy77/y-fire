import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  external: ['firebase', 'yjs', 'y-protocols'],
  treeshake: true,
  sourcemap: true,
}) 