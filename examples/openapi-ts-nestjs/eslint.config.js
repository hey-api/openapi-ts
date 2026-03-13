import nestjsTyped from '@darraghor/eslint-plugin-nestjs-typed';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['src/client/**'],
  },
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
];
