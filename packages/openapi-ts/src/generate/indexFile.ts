import { compiler } from '../compiler';
import { getClientPlugin } from '../plugins/@hey-api/client-core/utils';
import type { Files } from '../types/utils';
import { getConfig, legacyNameFromConfig } from '../utils/config';
import { TypeScriptFile } from './files';

export const generateIndexFile = ({ files }: { files: Files }): void => {
  const config = getConfig();

  files.index = new TypeScriptFile({
    dir: config.output.path,
    id: 'index',
    name: 'index.ts',
  });

  if (legacyNameFromConfig(config)) {
    files.index.add(
      compiler.exportNamedDeclaration({
        exports: legacyNameFromConfig(config)!,
        module: `./${legacyNameFromConfig(config)}`,
      }),
    );
  }

  if (config.exportCore) {
    files.index.add(
      compiler.exportNamedDeclaration({
        exports: 'ApiError',
        module: './core/ApiError',
      }),
    );
    if (config.plugins['@hey-api/sdk']?.response === 'response') {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: { asType: true, name: 'ApiResult' },
          module: './core/ApiResult',
        }),
      );
    }
    if (legacyNameFromConfig(config)) {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: 'BaseHttpRequest',
          module: './core/BaseHttpRequest',
        }),
      );
    }
    const clientPlugin = getClientPlugin(config);
    if (clientPlugin.name !== 'legacy/angular') {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: ['CancelablePromise', 'CancelError'],
          module: './core/CancelablePromise',
        }),
      );
    }
    files.index.add(
      compiler.exportNamedDeclaration({
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

      if (['sdk', 'types'].includes(name)) {
        files.index!.add(
          compiler.exportAllDeclaration({
            module: `./${file.nameWithoutExtension()}`,
          }),
        );
      }
    });
};
