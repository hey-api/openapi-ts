import nestjsTyped from '@darraghor/eslint-plugin-nestjs-typed';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  nestjsTyped.flatRecommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    ignores: ['src/client/**'],
  },
];
