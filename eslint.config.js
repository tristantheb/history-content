import react from 'eslint-plugin-react';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

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
      parser: babelParser,
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
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.browser, ...globals.node },
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json'
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn'],
      'no-unused-vars': 'off'
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    }
  },
  {
    files: ['.github/scripts/**/*.js', '.github/scripts/**/*.cjs'],
    rules: {
      'no-console': 'off'
    }
  },
];
