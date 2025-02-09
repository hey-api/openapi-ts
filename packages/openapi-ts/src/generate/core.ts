import fs from 'node:fs';
import path from 'node:path';

import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
import type { Client } from '../types/client';
import { getConfig, legacyNameFromConfig } from '../utils/config';
import { getHttpRequestName } from '../utils/getHttpRequestName';
import type { Templates } from '../utils/handlebars';

/**
 * Generate OpenAPI core files, this includes the basic boilerplate code to handle requests.
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 */
export const generateLegacyCore = async (
  outputPath: string,
  client: Client,
  templates: Templates,
): Promise<void> => {
  const config = getConfig();

  if (config.exportCore) {
    const clientPlugin = getClientPlugin(config);
    const context = {
      httpRequest: getHttpRequestName(clientPlugin.name),
      server: config.base !== undefined ? config.base : client.server,
      version: client.version,
    };

    fs.rmSync(path.resolve(outputPath), {
      force: true,
      recursive: true,
    });
    fs.mkdirSync(path.resolve(outputPath), {
      recursive: true,
    });

    await fs.writeFileSync(
      path.resolve(outputPath, 'OpenAPI.ts'),
      templates.core.settings({
        $config: config,
        ...context,
      }),
    );
    await fs.writeFileSync(
      path.resolve(outputPath, 'ApiError.ts'),
      templates.core.apiError({
        $config: config,
        ...context,
      }),
    );
    await fs.writeFileSync(
      path.resolve(outputPath, 'ApiRequestOptions.ts'),
      templates.core.apiRequestOptions({
        $config: config,
        ...context,
      }),
    );
    await fs.writeFileSync(
      path.resolve(outputPath, 'ApiResult.ts'),
      templates.core.apiResult({
        $config: config,
        ...context,
      }),
    );
    if (clientPlugin.name !== 'legacy/angular') {
      await fs.writeFileSync(
        path.resolve(outputPath, 'CancelablePromise.ts'),
        templates.core.cancelablePromise({
          $config: config,
          ...context,
        }),
      );
    }
    await fs.writeFileSync(
      path.resolve(outputPath, 'request.ts'),
      templates.core.request({
        $config: config,
        ...context,
      }),
    );

    if (legacyNameFromConfig(config)) {
      await fs.writeFileSync(
        path.resolve(outputPath, 'BaseHttpRequest.ts'),
        templates.core.baseHttpRequest({
          $config: config,
          ...context,
        }),
      );
      await fs.writeFileSync(
        path.resolve(outputPath, `${context.httpRequest}.ts`),
        templates.core.httpRequest({
          $config: config,
          ...context,
        }),
      );
    }

    if (config.request) {
      const requestFile = path.resolve(process.cwd(), config.request);
      const requestFileExists = await fs.existsSync(requestFile);
      if (!requestFileExists) {
        throw new Error(`Custom request file "${requestFile}" does not exists`);
      }
      await fs.copyFileSync(
        requestFile,
        path.resolve(outputPath, 'request.ts'),
      );
    }
  }
};
