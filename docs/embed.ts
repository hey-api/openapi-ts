import sdk from '@stackblitz/sdk';

export const embedProject = (projectId: string) => async (event: Event) => {
  const container = document.createElement('div');

  if (event.target) {
    const node = event.target as HTMLElement;
    node.replaceWith(container);
  }

  switch (projectId) {
    case 'hey-api-client-fetch-example':
      return await sdk.embedProjectId(container, projectId, {
        height: 700,
        openFile:
          'openapi-ts.config.ts,src/client/schemas.gen.ts,src/client/services.gen.ts,src/client/types.gen.ts,src/App.tsx',
        view: 'editor',
      });
    case 'hey-api-example':
      return await sdk.embedProjectId(container, projectId, {
        height: 700,
        openFile:
          'openapi-ts.config.ts,src/client/schemas.gen.ts,src/client/services.gen.ts,src/client/types.gen.ts',
        view: 'editor',
      });
  }
};
