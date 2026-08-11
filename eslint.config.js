import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default [
  // server/ has its own eslint.config.js (Node globals, no React rules) —
  // excluded here so `npm run lint` at the root doesn't double-lint it.
  { ignores: ['dist/**', 'node_modules/**', 'server/**'] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
    },
    plugins: { 'react-refresh': reactRefresh, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      // Hand-picked rather than spreading reactHooks.configs.recommended:
      // eslint-plugin-react-hooks v7's "recommended"/"recommended-latest"
      // both bundle a large React-Compiler-oriented rule set (purity,
      // set-state-in-effect, etc.) that flags extremely common,
      // perfectly safe patterns already used throughout this codebase
      // (setState after a data fetch in an effect). This project doesn't
      // use the React Compiler, so only the two classic, genuinely
      // valuable correctness rules are enabled.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // No PropTypes anywhere in this codebase; not worth introducing now.
      'react/prop-types': 'off',
      // Fires on ordinary apostrophes/quotes in JSX text (contractions
      // like "don't", quoted phrases) — renders fine in the browser, and
      // most of the ~90 hits are in the 12 lesson pages, which are out
      // of scope to edit for a lint-tooling pass.
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  prettierConfig,
];
