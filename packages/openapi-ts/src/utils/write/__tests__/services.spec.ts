import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { TypeScriptFile } from '../../../compiler';
import type { Operation } from '../../../openApi';
import { setConfig } from '../../config';
import { processServices } from '../services';

vi.mock('node:fs');

describe('processServices', () => {
  it('writes to filesystem', async () => {
    setConfig({
      client: 'fetch',
      debug: false,
      dryRun: false,
      exportCore: true,
      input: '',
      output: {
        path: '',
      },
      schemas: {},
      services: {
        asClass: true,
      },
      types: {},
      useOptions: false,
    });

    const client: Parameters<typeof processServices>[0]['client'] = {
      models: [],
      server: 'http://localhost:8080',
      services: [
        {
          $refs: [],
          imports: [],
          name: 'User',
          operations: [],
        },
      ],
      types: {},
      version: 'v1',
    };

    const file = new TypeScriptFile({
      dir: '/',
      name: 'services.ts',
    });
    const files = {
      services: file,
    };

    await processServices({ client, files });

    file.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/services.gen.ts'),
      expect.anything(),
    );
  });
});

describe('methodNameBuilder', () => {
  // If the generated text has the expected method, tests are considered pass.

  const operation: Operation = {
    $refs: [],
    deprecated: false,
    description: null,
    errors: [],
    id: 'User_get',
    imports: [],
    method: 'GET',
    name: 'userGet',
    parameters: [],
    parametersBody: null,
    parametersCookie: [],
    parametersForm: [],
    parametersHeader: [],
    parametersPath: [],
    parametersQuery: [],
    path: '/users',
    responseHeader: null,
    results: [],
    service: 'User',
    summary: null,
  };

  const client: Parameters<typeof processServices>[0]['client'] = {
    models: [],
    server: 'http://localhost:8080',
    services: [
      {
        $refs: [],
        imports: [],
        name: 'User',
        operations: [operation],
      },
    ],
    types: {},
    version: 'v1',
  };

  it('use default name', async () => {
    setConfig({
      client: 'fetch',
      debug: false,
      dryRun: false,
      exportCore: true,
      input: '',
      output: {
        path: '',
      },
      schemas: {},
      services: {
        asClass: true,
      },
      types: {},
      useOptions: false,
    });

    const file = new TypeScriptFile({
      dir: '/',
      name: 'services.ts',
    });
    const files = {
      services: file,
    };

    await processServices({ client, files });

    file.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/services.gen.ts'),
      expect.stringContaining('public static userGet()'),
    );
  });

  it('call methodNameBuilder', async () => {
    const methodNameBuilderMock = vi.fn().mockReturnValue('customName');

    setConfig({
      client: 'fetch',
      debug: false,
      dryRun: false,
      exportCore: true,
      input: '',
      output: {
        path: '',
      },
      schemas: {},
      services: {
        asClass: true,
        methodNameBuilder: methodNameBuilderMock,
      },
      types: {},
      useOptions: false,
    });

    const file = new TypeScriptFile({
      dir: '/',
      name: 'services.ts',
    });
    const files = {
      services: file,
    };

    await processServices({ client, files });

    file.write();

    expect(writeFileSync).toHaveBeenCalledWith(
      path.resolve('/services.gen.ts'),
      expect.stringContaining('public static customName()'),
    );

    expect(methodNameBuilderMock).toHaveBeenCalledWith(operation);
  });
});
