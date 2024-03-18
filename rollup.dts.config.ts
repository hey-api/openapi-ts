import { readFileSync } from 'node:fs';

import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)).toString());

const external = [/^node:*/, ...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)];

export default defineConfig({
    input: {
        index: './temp/node/index.d.ts',
    },
    output: {
        dir: './dist/node',
        format: 'esm',
    },
    external,
    plugins: [dts({ respectExternal: true })],
});
