// import replace from '@rollup/plugin-replace'
import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  dist: 'dist',
  tsconfig: 'tsconfig.dist.json',
  // rollup: {
  //   plugins: [
  //     replace({
  //       preventAssignment: true,
  //       __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  //     }),
  //   ],
  // },

  babel: {
    styledComponents: true, 
  },

  // Remove this block to enable strict export validation
  extract: {
    rules: {
      'ae-incompatible-release-tags': 'off',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'off',
    },
    checkTypes: false,
  }
})
