import path from 'node:path';

import type { IRContext } from '../ir/context';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig, isLegacyClient } from '../utils/config';
import { TypeScriptFile } from './files';

export const generatePlugins = async ({
  client,
  files,
  context,
}: {
  client: Client | undefined;
  context: IRContext | undefined;
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

    if (context) {
      plugin.handler_experimental({
        context,
        files,
        plugin: plugin as never,
      });
    } else if (client) {
      plugin.handler({
        client,
        files,
        plugin: plugin as never,
      });
    }
  }
};
