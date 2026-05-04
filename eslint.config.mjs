import neostandard from 'neostandard'
import globals from 'globals'

export default [
  {
    ignores: [
      'cjs',
      'esm',
      'node_modules',
      'example',
      'test/deno',
      'i18nextHttpBackend.js',
      'i18nextHttpBackend.min.js',
      '**/*.d.ts',
      '**/*.d.mts',
    ],
  },
  ...neostandard(),
  {
    files: ['test/**/*.js', 'test/**/*.cjs'],
    languageOptions: {
      globals: { ...globals.mocha },
    },
  },
  {
    rules: {
      '@stylistic/array-bracket-spacing': 'off',
      'n/no-callback-literal': 'off',
    },
  },
]
