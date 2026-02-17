import {defineProject} from 'vitest/config'

export default defineProject({
  test: {
    name: 'core-backend',
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})