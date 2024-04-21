import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginSortKeysFix from 'eslint-plugin-sort-keys-fix';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
    },
    plugins: {
      'simple-import-sort': eslintPluginSimpleImportSort,
      'sort-keys-fix': eslintPluginSortKeysFix,
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-ts-ignore': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'arrow-body-style': 'error',
      'import/order': 'off',
      'no-prototype-builtins': 'off',
      'object-shorthand': 'error',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
      'sort-imports': 'off',
      'sort-keys-fix/sort-keys-fix': 'warn',
    },
  },
  eslintConfigPrettier,
  {
    ignores: ['**/dist/', '**/node_modules/', 'temp/'],
  },
);
