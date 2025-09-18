import react from 'eslint-plugin-react';
import globals from 'globals';

export default [
  {
    files: ['**/*.{js,cjs,mjs}'],
    ignores: ['dist/**', 'node_modules/**', '**/*.{jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.browser, ...globals.node },
      sourceType: 'module'
    },
    rules: {
      'eol-last': ['error', 'always'],
      'indent': ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single'],
      semi: 'error',
      'no-console': 'warn',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-vars': 'warn',
    }
  },
  {
    files: ['**/*.{jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.browser, ...globals.node },
      sourceType: 'module',
      parser: (await import('@babel/eslint-parser')).default,
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    rules: {
      'eol-last': ['error', 'always'],
      'indent': ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single'],
      semi: 'error',
      'no-console': 'warn',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-vars': 'off',
    },
    plugins: { react }
  },
  {
    files: ['scripts/**/*.js', 'scripts/**/*.cjs'],
    rules: {
      'no-console': 'off'
    }
  },
];
