import type { DefinePlugin, IR } from '@hey-api/openapi-ts';

import { authSet } from './.gen/index.ts';

type MyPluginConfig = { readonly name: 'myplugin' };
type MyPlugin = DefinePlugin<MyPluginConfig>;

export function f(schema: IR.SchemaObject, plugin: MyPlugin['Instance']) {
  plugin.context.resolveIrRef(schema.$ref!);
}

export const handler: MyPlugin['Handler'] = ({ plugin }) => {
  plugin.forEach('schema', 'operation', (event) => {
    console.log(event);
  });
};

console.log(
  authSet({
    auth: {
      access: '',
      expires: 1,
      refresh: '',
      type: 'oauth',
    },
    id: '123',
  }),
);
