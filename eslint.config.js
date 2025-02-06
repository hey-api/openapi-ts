import eslint from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginSortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import pluginSortKeysFix from 'eslint-plugin-sort-keys-fix';
import pluginTypeScriptSortKeys from 'eslint-plugin-typescript-sort-keys';
// import pluginVue from 'eslint-plugin-vue'
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      'simple-import-sort': pluginSimpleImportSort,
      'sort-destructure-keys': pluginSortDestructureKeys,
      'sort-keys-fix': pluginSortKeysFix,
      'typescript-sort-keys': pluginTypeScriptSortKeys,
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-ts-ignore': 'off',
      '@typescript-eslint/consistent-type-imports': 'warn',
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
      'sort-destructure-keys/sort-destructure-keys': 'warn',
      'sort-imports': 'off',
      'sort-keys-fix/sort-keys-fix': 'warn',
      'typescript-sort-keys/interface': 'warn',
      'typescript-sort-keys/string-enum': 'warn',
    },
  },
  {
    files: ['packages/openapi-ts/test/e2e/assets/main-angular-module.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  configPrettier,
  {
    ignores: [
      '**/.tsup/',
      '**/dist/',
      '**/node_modules/',
      'temp/',
      'packages/openapi-ts/src/legacy/handlebars/compiled/**/*.js',
      'packages/openapi-ts/src/legacy/handlebars/templates/**/*.hbs',
      '**/test/e2e/generated/',
      '**/test/generated/',
      '**/__snapshots__/',
      '**/.next/',
      '**/.nuxt/',
      '**/.output/',
      '**/.svelte-kit/',
      '**/.vitepress/cache',
      '**/.vitepress/dist',
      '**/.angular',
    ],
  },
);
