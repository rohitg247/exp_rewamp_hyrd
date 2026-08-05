import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    ignores: [
      'dist',
      // 2026-08-03: pre-revamp snapshot, kept as the rollback copy (this project
      // is not in git). Not source — must not be linted or bundled.
      '.revamp-backup-*',
      // Abandoned "copy" duplicates left in place on purpose. They are not
      // imported by App.jsx; linting them only produces noise. Delete them and
      // these two patterns can go.
      '**/* copy.{js,jsx}',
      '**/* copy [0-9].{js,jsx}',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      // 2026-08-03: this codebase has never used runtime prop validation and
      // `prop-types` is not a dependency (it is also deprecated in React 19).
      // The rule produced 615 of the 987 lint problems and flagged zero real
      // defects. Turned off deliberately rather than papered over per-file.
      'react/prop-types': 'off',
      // Non-breaking spaces inside JSX text and strings are intentional content
      // (e.g. "10 °C"). Keep the rule for irregular whitespace in actual code,
      // where it really is a syntax hazard.
      'no-irregular-whitespace': [
        'error',
        { skipStrings: true, skipTemplates: true, skipJSXText: true, skipComments: true },
      ],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
