import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  external: [
    'firebase',
    'firebase/app',
    'firebase/firestore',
    '@firebase/app',
    '@firebase/firestore',
    'yjs',
    'y-protocols',
    'y-protocols/awareness',
    'lib0/observable',
    'idb-keyval',
    'simple-peer-light'
  ],
  treeshake: true,
  sourcemap: true,
  target: 'es2020',
  platform: 'neutral',
}) 