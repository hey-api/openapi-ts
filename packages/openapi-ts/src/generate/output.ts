import fs from 'node:fs';
import path from 'node:path';

import type { ProjectRenderMeta } from '@hey-api/codegen-core';

import type { IR } from '../ir/types';
import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
import { generateClientBundle } from './client';
import { findTsConfigPath, loadTsConfig } from './tsConfig';
import { removeDirSync } from './utils';

export const generateOutput = async ({ context }: { context: IR.Context }) => {
  const outputPath = path.resolve(context.config.output.path);

  if (context.config.output.clean) {
    removeDirSync(outputPath);
  }

  const tsConfig = loadTsConfig(
    findTsConfigPath(context.config.output.tsConfigPath),
  );

  const meta: ProjectRenderMeta = {
    moduleResolution: tsConfig?.options.moduleResolution,
  };

  const client = getClientPlugin(context.config);
  if ('bundle' in client.config && client.config.bundle) {
    // not proud of this one
    // @ts-expect-error
    context.config._FRAGILE_CLIENT_BUNDLE_RENAMED = generateClientBundle({
      meta,
      outputPath,
      // @ts-expect-error
      plugin: client,
      project: context.gen,
    });
  }

  for (const plugin of context.registerPlugins()) {
    await plugin.run();
  }

  for (const file of context.gen.render(meta)) {
    const filePath = path.resolve(outputPath, file.path);
    const dir = path.dirname(filePath);
    if (!context.config.dryRun) {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, file.content, { encoding: 'utf8' });
    }
  }
};
