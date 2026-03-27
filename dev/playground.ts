import type { DefinePlugin, IR } from '@hey-api/openapi-ts';
import { setupServer } from 'msw/node';

import { client } from './gen/typescript/client.gen';
// import { createOpencode } from '@opencode-ai/sdk';
import { createMswHandlers, handleTuiPublish } from './gen/typescript/msw.gen';
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

const handlers = createMswHandlers({
  baseUrl: 'https://api.example.com',
});

const server = setupServer(
  // ...handlers.all({
  //   // overrides: {
  //   //   tuiPublish: {
  //   //     result: true,
  //   //   },
  //   // },
  // }),
  handleTuiPublish({
    result: false,
  }),
  handlers.one.tuiPublish(
    {
      result: false,
      // status: 200,
    },
    {
      // ...
    },
  ),
);
server.listen();

async function run() {
  // const { client, server } = await createOpencode();
  // console.log(client, server);
  client.setConfig({
    baseUrl: 'https://api.example.com',
  });
  const sdk = new OpenCode({ client });
  const published = await sdk.tui.publish({
    body: {
      properties: {
        message: 'Hello from Hey API OpenAPI TypeScript Playground!',
        variant: 'success',
      },
      type: 'tui.toast.show',
    },
    directory: 'main',
  });
  console.log('Published:', published.data, published.error);
}

run();
