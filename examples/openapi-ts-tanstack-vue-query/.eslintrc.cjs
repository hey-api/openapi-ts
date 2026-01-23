/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  files: ['**/*.{vue,js,jsx,cjs,mjs,ts,tsx,cts,mts}'],
  parserOptions: {
    ecmaVersion: 'latest'
  }
}
