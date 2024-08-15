import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { ClassElement, compiler, TypeScriptFile } from '../compiler';
import type { OpenApi } from '../openApi';
import type { Client } from '../types/client';
import { Config } from '../types/config';
import { Files } from '../types/utils';
import { camelCase } from '../utils/camelCase';
import { getConfig } from '../utils/config';
import { getHttpRequestName } from '../utils/getHttpRequestName';
import type { Templates } from '../utils/handlebars';
import { sortByName } from '../utils/sort';
import { clientModulePath } from './client';
import { ensureDirSync } from './utils';

const operationServiceName = (name: string): string =>
  `${camelCase({
    input: name,
    pascalCase: true,
  })}Service`;

const operationVarName = (name: string): string =>
  `${camelCase({
    input: name,
    pascalCase: false,
  })}`;

const sdkName = (name: Config['services']['sdk']): string =>
  name && typeof name === 'string' ? name : 'Sdk';

/**
 * Generate the Full SDK class
 */
export const generateSDKClass = async ({
  client,
  files,
}: {
  client: Client;
  files: Files;
}) => {
  const config = getConfig();
  client;
  if (!config.services.export || !config.services.sdk) {
    return;
  }

  files.sdk = new TypeScriptFile({
    dir: config.output.path,
    name: 'sdk.ts',
  });

  // imports
  files.sdk.import({
    module: clientModulePath(),
    name: 'createClient',
  });
  files.sdk.import({
    module: clientModulePath(),
    name: 'createConfig',
  });
  files.sdk.import({
    module: clientModulePath(),
    name: 'Config',
  });
  client.services.map((service) => {
    files.sdk.import({
      // this detection could be done safer, but it shouldn't cause any issues
      module: `./services.gen`,
      name: operationServiceName(service.name),
    });
  });

  const instanceVars: ClassElement[] = client.services.map((service) => {
    const node = compiler.createPropertyDeclaration({
      accessLevel: 'public',
      isReadonly: true,
      name: operationVarName(service.name),
      type: operationServiceName(service.name),
    });
    return node;
  });

  instanceVars.push(
    compiler.createPropertyDeclaration({
      accessLevel: 'public',
      isReadonly: true,
      name: 'client',
      type: getHttpRequestName(config.client),
    }),
  );

  const serviceAssignments = client.services.map((service) => {
    const node = compiler.expressionToStatement({
      expression: compiler.binaryExpression({
        left: compiler.propertyAccessExpression({
          expression: 'this',
          name: operationVarName(service.name),
        }),
        right: compiler.newExpression({
          args: [
            compiler.propertyAccessExpression({
              expression: 'this',
              name: 'client',
            }),
          ],
          expression: compiler.identifier({
            text: operationServiceName(service.name),
          }),
        }),
      }),
    });
    return node;
  });
  const clientAssignment = compiler.expressionToStatement({
    expression: compiler.binaryExpression({
      left: compiler.propertyAccessExpression({
        expression: 'this',
        name: 'client',
      }),
      right: compiler.callExpression({
        functionName: 'createClient',
        parameters: [
          compiler.binaryExpression({
            left: compiler.identifier({ text: 'config' }),
            operator: '??',
            right: compiler.callExpression({
              functionName: 'createConfig',
            }),
          }),
        ],
      }),
    }),
  });
  const constructor = compiler.constructorDeclaration({
    multiLine: true,
    parameters: [
      {
        isRequired: false,
        name: 'config',
        type: 'Config',
      },
    ],
    statements: [
      clientAssignment,
      compiler.expressionToStatement({
        expression: compiler.identifier({ text: '\n' }),
      }),
      ...serviceAssignments,
    ],
  });

  const statement = compiler.classDeclaration({
    decorator:
      config.client.name === 'angular'
        ? { args: [{ providedIn: 'root' }], name: 'Injectable' }
        : undefined,
    members: [...instanceVars, constructor],
    name: sdkName(config.services.sdk),
    spaceBetweenMembers: false,
  });
  files.sdk.add(statement);

  const defaultExport = compiler.exportDefaultDeclaration({
    expression: compiler.identifier({ text: sdkName(config.services.sdk) }),
  });

  files.sdk.add(defaultExport);
};

/**
 * @deprecated
 * Generate the OpenAPI client index file using the Handlebar template and write it to disk.
 * The index file just contains all the exports you need to use the client as a standalone
 * library. But yuo can also import individual models and services directly.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 */
export const generateClientClass = async (
  openApi: OpenApi,
  outputPath: string,
  client: Client,
  templates: Templates,
) => {
  const config = getConfig();

  const templateResult = templates.client({
    $config: config,
    ...client,
    httpRequest: getHttpRequestName(config.client),
    models: sortByName(client.models),
    services: sortByName(client.services),
  });

  if (config.name) {
    ensureDirSync(outputPath);
    writeFileSync(
      path.resolve(outputPath, `${config.name}.ts`),
      templateResult,
    );
  }
};
