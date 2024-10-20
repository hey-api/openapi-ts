import path from 'node:path';

import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig, isLegacyClient } from '../utils/config';
import { TypeScriptFile } from './files';

export const generateLegacyPlugins = async ({
  client,
  files,
}: {
  client: Client;
  files: Files;
}) => {
  const config = getConfig();

  if (isLegacyClient(config)) {
    // plugins do not work with legacy clients
    return;
  }

  for (const plugin of config.plugins) {
    const outputParts = plugin.output.split('/');
    const outputDir = path.resolve(
      config.output.path,
      ...outputParts.slice(0, outputParts.length - 1),
    );
    files[plugin.name] = new TypeScriptFile({
      dir: outputDir,
      name: `${outputParts[outputParts.length - 1]}.ts`,
    });
    plugin.handlerLegacy({
      client,
      files,
      plugin: plugin as never,
    });
  }
};
