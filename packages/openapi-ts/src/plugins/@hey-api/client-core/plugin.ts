import { TypeScriptRenderer } from '../../../generate/renderer';
import { createClient } from './client';
import { createClientConfigType } from './createClientConfig';
import type { PluginHandler } from './types';

export const clientPluginHandler = ({
  plugin,
}: Parameters<PluginHandler>[0]) => {
  const f = plugin.gen.createFile(plugin.output, {
    extension: '.ts',
    path: '{{path}}.gen',
    renderer: new TypeScriptRenderer(),
  });

  createClientConfigType({ plugin });
  createClient({ plugin });

  if (plugin.config.exportFromIndex && f.hasContent()) {
    const index = plugin.gen.ensureFile('index');
    index.addExport({ from: f, namespaceImport: true });
  }
};
