import type { DefinePlugin, IR } from '@hey-api/openapi-ts';
import { fromOpenApi } from '@msw/source/open-api';
import { setupServer } from 'msw/node';

import { client } from './gen/typescript/client.gen';
// import { createOpencode } from '@opencode-ai/sdk';
import { createMswHandlers } from './gen/typescript/msw.gen';
import { Sdk } from './gen/typescript/sdk.gen';
import spec from './opencode.json';

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

const sourceHandlers = await fromOpenApi({
  ...(spec as any),
  basePath: 'https://api.example.com',
});
const handlers = createMswHandlers({
  baseUrl: 'https://api.heyapi.dev',
});

const server = setupServer(
  // ...sourceHandlers,
  // handlers.pick.get({
  //   body: 'Hi',
  // }),
  ...handlers.all({
    pick: {
      // ...
    },
  }),
);
server.listen();

async function run() {
  // const { client, server } = await createOpencode();
  // console.log(client, server);
  const sdk = new Sdk({ client });
  // const published = await sdk.tui.publish({
  //   body: {
  //     properties: {
  //       message: 'Hello from Hey API OpenAPI TypeScript Playground!',
  //       variant: 'success',
  //     },
  //     type: 'tui.toast.show',
  //   },
  //   directory: 'main',
  // });
  // console.log('Published:', published.data, published.error);
  const project = await sdk.getFoo({
    // ...
  });
  console.log('Updated Project:', project.data, project.error);
}

run();
