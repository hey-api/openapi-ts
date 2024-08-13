import eslint from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
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
      'sort-keys-fix': pluginSortKeysFix,
      'typescript-sort-keys': pluginTypeScriptSortKeys,
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
      'typescript-sort-keys/interface': 'warn',
      'typescript-sort-keys/string-enum': 'warn',
    },
  },
  configPrettier,
  {
    ignores: [
      '**/dist/',
      '**/node_modules/',
      'temp/',
      '**/test/e2e/generated/',
      '**/test/generated/',
      '**/.svelte-kit/',
      '**/.vitepress/cache',
      '**/.vitepress/dist',
    ],
  },
);
