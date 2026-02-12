import type { DefinePlugin, IR } from '@hey-api/openapi-ts';

// import { createOpencode } from '@opencode-ai/sdk';
import { PetStore } from './.gen/sdk.gen.ts';

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

async function run() {
  // const { client, server } = await createOpencode();
  // console.log(client, server);
  const client = new PetStore();
  client.tui.publish({
    body: {
      properties: {
        message: 'Hello from Hey API OpenAPI TS Playground!',
        variant: 'success',
      },
      type: 'tui.toast.show',
    },
    directory: 'main',
  });
}

run();
