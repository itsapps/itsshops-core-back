import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli/index.ts', // Move your commander logic here
    components: 'src/components/index.ts',
    localization: 'src/localization/index.ts',
    'sanity.config': 'sanity.config.ts',
  },
  format: ['esm'],         // Sanity v3+ and Node 22+ prefer ESM
  dts: true,               // Essential: generates the .d.ts files for customer autocomplete
  splitting: true,         // Allows shared code between index and components
  clean: true,             // Wipes dist folder before each build
  minify: false,           // Easier to debug your core code in node_modules
  sourcemap: true,
  target: 'node22',
  external: ['sanity', 'react', 'styled-components'], // Peer dependencies
})