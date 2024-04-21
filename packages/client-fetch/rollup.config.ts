import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import type { RollupOptions } from 'rollup';
import { defineConfig } from 'rollup';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url)).toString(),
);

export const externalDependencies = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
];

function createConfig(isProduction: boolean) {
  return defineConfig({
    external: externalDependencies,
    input: path.resolve(__dirname, 'src/index.ts'),
    output: {
      file: path.resolve(__dirname, 'dist/index.cjs'),
      format: 'cjs',
    },
    plugins: [
      typescript({
        declaration: false,
        tsconfig: path.resolve(__dirname, 'src/tsconfig.json'),
      }),
      commonjs({
        sourceMap: false,
      }),
      isProduction && terser(),
    ],
  });
}

export default (commandLineArgs: any): RollupOptions[] => {
  const isDev = commandLineArgs.watch;
  const isProduction = !isDev;
  return defineConfig([createConfig(isProduction)]);
};
