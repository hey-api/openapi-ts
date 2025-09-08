import { tsc } from '../../../tsc';
import type { HeyApiClientNestjsPlugin } from './types';
import {
  createClientClassName,
  createModuleClassName,
  getClientName,
} from './utils';

/**
 * Service group information for index generation
 */
interface ServiceGroup {
  className: string;
  tag: string;
}

/**
 * Generates the main index.ts file that exports everything
 */
export const generateNestjsIndex = ({
  plugin,
  serviceGroups,
}: {
  plugin: Parameters<HeyApiClientNestjsPlugin['Handler']>[0]['plugin'];
  serviceGroups: Map<string, ServiceGroup>;
}) => {
  const clientName = getClientName(plugin.config);
  const moduleClassName =
    plugin.config.moduleName || createModuleClassName(clientName);
  const clientClassName =
    plugin.config.clientClassName || createClientClassName(clientName);

  // Create the index file
  const file = plugin.createFile({
    id: 'nestjs-index',
    path: `${plugin.output}/index`,
  });

  // Create module export
  const moduleExport = tsc.exportNamedDeclaration({
    exports: [moduleClassName],
    module: `./${clientName.toLowerCase()}.module.gen`,
  });
  file.add(moduleExport);

  // Create client export
  const clientExport = tsc.exportNamedDeclaration({
    exports: [clientClassName],
    module: `./${clientName.toLowerCase()}-client.service.gen`,
  });
  file.add(clientExport);

  // Create service exports
  for (const group of serviceGroups.values()) {
    const serviceExport = tsc.exportNamedDeclaration({
      exports: [group.className],
      module: `./services/${clientName.toLowerCase()}-${group.tag.toLowerCase()}.service.gen`,
    });
    file.add(serviceExport);
  }

  // Create type exports
  const typeExport = tsc.exportNamedDeclaration({
    exports: [
      'ClientModuleConfig',
      'ClientModuleAsyncConfig',
      'RequestOptions',
      'ApiResponse',
      'ApiError',
    ],
    module: './types.gen',
  });
  file.add(typeExport);
};
