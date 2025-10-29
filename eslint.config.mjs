import stylistic from '@stylistic/eslint-plugin'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = [
  { ignores: ['dist/', 'node_modules/'] },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2021,
        sourceType: 'module'
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly'
      }
    },
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': tsPlugin
    },
    rules: {
      'comma-dangle': ['error', 'never'],
      '@stylistic/arrow-spacing': 'error',
      '@stylistic/block-spacing': 'error',
      '@stylistic/comma-spacing': ['error', {
        'before': false,
        'after': true
      }],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/key-spacing': ['error', {
        'beforeColon': false,
        'afterColon': true
      }],
      '@stylistic/keyword-spacing': ['error', {
        'before': true,
        'after': true
      }],
      '@stylistic/max-len': ['error', { 'code': 120, 'comments': 80 }],
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/space-before-blocks': 'error',
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/switch-colon-spacing': 'error',
      '@stylistic/type-named-tuple-spacing': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error', { 'argsIgnorePattern': '^_' }
      ],
      '@stylistic/no-trailing-spaces': 'error',
      'no-unused-vars': 'error',
      'no-undef': 'error'
    }
  },
  {
    files: ['.github/scripts/**/*.js', '.github/scripts/**/*.cjs'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['src/workers/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        self: 'readonly',
        postMessage: 'readonly',
        fetch: 'readonly'
      }
    }
  },
]

export default config
