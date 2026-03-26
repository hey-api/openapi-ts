/* eslint-disable */
import type { DefinePlugin, IR } from '@hey-api/openapi-ts';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { client } from './gen/typescript/client.gen';
// import { createOpencode } from '@opencode-ai/sdk';
import { createMswHandlerFactory } from './gen/typescript/msw.gen';
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
  createMswHandlerFactory({
    baseUrl: 'https://api.example.com',
  }).tuiPublishMock(),
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
  sdk.tui.publish({
    body: {
      properties: {
        message: 'Hello from Hey API OpenAPI TypeScript Playground!',
        variant: 'success',
      },
      type: 'tui.toast.show',
    },
    directory: 'main',
  });
}

run();
