import type { DefinePlugin, IR } from '@hey-api/openapi-ts';

// import { createOpencode } from '@opencode-ai/sdk';
import { client } from './gen/typescript/client.gen';
import { OpenCode } from './gen/typescript/sdk.gen';

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
  client.setConfig({
    baseUrl: 'https://api.example.com',
  });
  const sdk = new OpenCode({ client });
  sdk.tui.publish({
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
