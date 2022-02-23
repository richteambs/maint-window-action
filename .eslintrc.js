module.exports = {
  extends: ['prettier'],
  plugins: ['@typescript-eslint', 'prettier', 'jest', 'eslint-plugin-import'],
  parser: '@typescript-eslint/parser',
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.test.ts', '**/tests/**/*.ts'],
      },
    ],
    '@typescript-eslint/indent': ['error', 2],
    'linebreak-style': ['error', require('os').EOL === '\r\n' ? 'windows' : 'unix'],
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'import/extensions': ['error', { ts: 'ignorePackages' }],
    'no-plusplus': 'off',
    'no-continue': 'off',
    'max-len': ['error', { code: 120, comments: 120 }],
    'object-curly-newline': 0,
  },
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      parserOptions: {
        ecmaVersion: 9,
        sourceType: 'module',
        // Note that we use a separate tsconfig just for linting, so that we include the test code
        project: './tsconfig.eslint.json',
      },
    },
    {
      files: ['*.test.ts'],
      rules: {
        'prefer-arrow-callback': 0,
        'func-names': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        'no-unused-expressions': 0,
      },
    },
  ],
  env: {
    node: true,
    es6: true,
    'jest/globals': true,
  },
};
