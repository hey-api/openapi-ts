import { compiler, TypeScriptFile } from '../compiler';
import type { Files } from '../types/utils';
import { getConfig } from '../utils/config';
import { appendExt } from '../utils/extension';

export const generateIndexFile = async ({
  files,
}: {
  files: Files;
}): Promise<void> => {
  const config = getConfig();

  files.index = new TypeScriptFile({
    dir: config.output.path,
    name: 'index.ts',
  });

  if (config.name) {
    files.index.add(
      compiler.exportNamedDeclaration({
        exports: config.name,
        module: appendExt(`./${config.name}`),
      }),
    );
  }

  if (config.exportCore) {
    files.index.add(
      compiler.exportNamedDeclaration({
        exports: 'ApiError',
        module: appendExt('./core/ApiError'),
      }),
    );
    if (config.services.response === 'response') {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: { asType: true, name: 'ApiResult' },
          module: appendExt('./core/ApiResult'),
        }),
      );
    }
    if (config.name) {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: 'BaseHttpRequest',
          module: appendExt('./core/BaseHttpRequest'),
        }),
      );
    }
    if (config.client.name !== 'angular') {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: ['CancelablePromise', 'CancelError'],
          module: appendExt('./core/CancelablePromise'),
        }),
      );
    }
    files.index.add(
      compiler.exportNamedDeclaration({
        exports: ['OpenAPI', { asType: true, name: 'OpenAPIConfig' }],
        module: appendExt('./core/OpenAPI'),
      }),
    );
  }

  Object.keys(files)
    .sort()
    .forEach((name) => {
      const file = files[name];

      if (name === 'index' || file.isEmpty()) {
        return;
      }

      files.index.add(
        compiler.exportAllDeclaration({
          module: appendExt(`./${file.getName(false)}`),
        }),
      );
    });
};
