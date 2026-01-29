import fs from 'node:fs';
import path from 'node:path';

import type { Context } from '@hey-api/shared';
import { IntentContext } from '@hey-api/shared';

// import { getTypedConfig } from '../config/utils';
// import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
// import { generateClientBundle } from './client';

export async function generateOutput(context: Context): Promise<void> {
  const outputPath = path.resolve(context.config.output.path);

  if (context.config.output.clean) {
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath, { force: true, recursive: true });
    }
  }

  // const config = getTypedConfig(context);

  // const client = getClientPlugin(config);
  // if ('bundle' in client.config && client.config.bundle && !config.dryRun) {
  // not proud of this one
  // // @ts-expect-error
  // config._FRAGILE_CLIENT_BUNDLE_RENAMED = generateClientBundle({
  //   meta: {
  //     importFileExtension: config.output.importFileExtension,
  //   },
  //   outputPath,
  //   // @ts-expect-error
  //   plugin: client,
  //   project: context.gen,
  // });
  // }

  for (const plugin of context.registerPlugins()) {
    await plugin.run();
  }

  context.gen.plan();

  const ctx = new IntentContext(context.spec);
  for (const intent of context.intents) {
    await intent.run(ctx);
  }

  for (const file of context.gen.render()) {
    const filePath = path.resolve(outputPath, file.path);
    const dir = path.dirname(filePath);
    if (!context.config.dryRun) {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, file.content, { encoding: 'utf8' });
    }
  }

  const { source } = context.config.output;
  if (source.enabled) {
    const sourcePath = source.path === null ? undefined : path.resolve(outputPath, source.path);
    if (!context.config.dryRun && sourcePath && sourcePath !== outputPath) {
      fs.mkdirSync(sourcePath, { recursive: true });
    }
    const serialized = await source.serialize(context.spec);
    // TODO: handle yaml (convert before writing)
    if (!context.config.dryRun && sourcePath) {
      fs.writeFileSync(
        path.resolve(sourcePath, `${source.fileName}.${source.extension}`),
        serialized,
        { encoding: 'utf8' },
      );
    }
    if (source.callback) {
      await source.callback(serialized);
    }
  }
}
