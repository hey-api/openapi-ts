import type { DefinePlugin, IR } from '@hey-api/openapi-ts';
import { fromOpenApi } from '@msw/source/open-api';
import { setupServer } from 'msw/node';

import { client } from './gen/typescript/client.gen';
// import { createOpencode } from '@opencode-ai/sdk';
import { createMswHandlers } from './gen/typescript/msw.gen';
import { OpenCode } from './gen/typescript/sdk.gen';
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
  baseUrl: 'https://api.example.com',
});

const server = setupServer(
  // ...sourceHandlers,
  ...handlers.all({
    one: {
      // projectUpdate(info) {
      //   console.log('Received request for projectUpdate with info:', info);
      // },
      projectUpdate: [
        undefined,
        // (info) => {
        //   console.log('Received request for projectUpdate with info:', info);
        // },
        // {
        //   result: {
        //     id: '123',
        //     name: 'Updated Project Name',
        //     time: {
        //       created: 1678900000000,
        //       updated: 1678900000000,
        //     },
        //     worktree: 'main',
        //     icon: {
        //       url: 'https://example.com/icon.png',
        //       color: 'blue',
        //     },
        //     vcs: 'git',
        //   },
        //   status: 200,
        // },
        {
          // baseUrl: 'https://api.example.com',
        },
      ],
      // projectUpdate: {
      //   result: {
      //     id: '123',
      //     name: 'Updated Project Name',
      //     time: {
      //       created: 1678900000000,
      //       updated: 1678900000000,
      //     },
      //     worktree: 'main',
      //     icon: {
      //       url: 'https://example.com/icon.png',
      //       color: 'blue',
      //     },
      //     vcs: 'git',
      //   },
      // },
    },
  }),
  // handlers.one.projectUpdate(),
  handlers.one.globalEvent({
    result: {
      directory: 'main',
      payload: {
        properties: {},
        type: 'global.disposed',
      },
    },
  }),
);
server.listen();

async function run() {
  // const { client, server } = await createOpencode();
  // console.log(client, server);
  client.setConfig({
    baseUrl: 'https://api.example.com',
  });
  const sdk = new OpenCode({ client });
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
  const project = await sdk.project.update({
    projectID: '123',
    directory: 'main',
    icon: {
      color: 'blue',
      url: 'https://example.com/icon.png',
    },
    name: 'Updated Project Name',
  });
  console.log('Updated Project:', project.data, project.error);
}

run();
