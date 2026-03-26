/* eslint-disable */
import type { DefinePlugin, IR } from '@hey-api/openapi-ts';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { client } from './gen/typescript/client.gen';
// import { createOpencode } from '@opencode-ai/sdk';
import { createMswHandlers } from './gen/typescript/msw.gen';
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

const server = setupServer(
  // ...createMswHandlers({
  //   baseUrl: 'https://api.example.com',
  // }).getAllHandlers(),
  createMswHandlers({
    baseUrl: 'https://api.example.com',
  }).tuiPublishMock({
    result: false,
    // status: 200,
  }),
  // http.post('*/tui/publish', () => HttpResponse.json({
  //   firstName: 'John',
  //   id: 'abc-123',
  //   lastName: 'Maverick',
  // })),
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
