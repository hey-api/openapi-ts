import fs from 'node:fs';
import path from 'node:path';

import type { Context } from '~/ir/context';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';

import { generateClientBundle } from './client';

export const generateOutput = async ({ context }: { context: Context }) => {
  const outputPath = path.resolve(context.config.output.path);

  if (context.config.output.clean) {
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath, { force: true, recursive: true });
    }
  }

  const client = getClientPlugin(context.config);
  if (
    'bundle' in client.config &&
    client.config.bundle &&
    !context.config.dryRun
  ) {
    // not proud of this one
    // @ts-expect-error
    context.config._FRAGILE_CLIENT_BUNDLE_RENAMED = generateClientBundle({
      meta: {
        importFileExtension: context.config.output.importFileExtension,
      },
      outputPath,
      // @ts-expect-error
      plugin: client,
      project: context.gen,
    });
  }

  for (const plugin of context.registerPlugins()) {
    await plugin.run();
  }

  for (const file of context.gen.render()) {
    const filePath = path.resolve(outputPath, file.path);
    const dir = path.dirname(filePath);
    if (!context.config.dryRun) {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, file.content, { encoding: 'utf8' });
    }
  }
};
