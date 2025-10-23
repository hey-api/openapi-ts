import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import { tsc } from '~/tsc';
import type { Files } from '~/types/utils';
import { getConfig, legacyNameFromConfig } from '~/utils/config';

import { GeneratedFile } from '../file';

export const generateIndexFile = ({ files }: { files: Files }): void => {
  const config = getConfig();

  files.index = new GeneratedFile({
    dir: config.output.path,
    id: 'index',
    name: 'index.ts',
  });

  if (legacyNameFromConfig(config)) {
    files.index.add(
      tsc.exportNamedDeclaration({
        exports: legacyNameFromConfig(config)!,
        module: `./${legacyNameFromConfig(config)}`,
      }),
    );
  }

  if (config.exportCore) {
    files.index.add(
      tsc.exportNamedDeclaration({
        exports: 'ApiError',
        module: './core/ApiError',
      }),
    );
    if (config.plugins['@hey-api/sdk']?.config.response === 'response') {
      files.index.add(
        tsc.exportNamedDeclaration({
          exports: { asType: true, name: 'ApiResult' },
          module: './core/ApiResult',
        }),
      );
    }
    if (legacyNameFromConfig(config)) {
      files.index.add(
        tsc.exportNamedDeclaration({
          exports: 'BaseHttpRequest',
          module: './core/BaseHttpRequest',
        }),
      );
    }
    const clientPlugin = getClientPlugin(config);
    if (clientPlugin.name !== 'legacy/angular') {
      files.index.add(
        tsc.exportNamedDeclaration({
          exports: ['CancelablePromise', 'CancelError'],
          module: './core/CancelablePromise',
        }),
      );
    }
    files.index.add(
      tsc.exportNamedDeclaration({
        exports: ['OpenAPI', { asType: true, name: 'OpenAPIConfig' }],
        module: './core/OpenAPI',
      }),
    );
  }

  Object.keys(files)
    .sort()
    .forEach((name) => {
      const file = files[name]!;

      if (name === 'index' || file.isEmpty()) {
        return;
      }

      if (file.exportFromIndex) {
        files.index!.add(
          tsc.exportAllDeclaration({
            module: `./${file.nameWithoutExtension()}`,
          }),
        );
      }
    });
};
