import { compiler, TypeScriptFile } from '../compiler';
import type { Files } from '../types/utils';
import { getConfig } from '../utils/config';

export const generateIndexFile = async ({
  files,
}: {
  files: Files;
}): Promise<void> => {
  const config = getConfig();

  const ext = config.output.extension || '';

  files.index = new TypeScriptFile({
    dir: config.output.path,
    name: 'index.ts',
  });

  if (config.name) {
    files.index.add(
      compiler.exportNamedDeclaration({
        exports: config.name,
        module: `./${config.name}${ext}`,
      }),
    );
  }

  if (config.exportCore) {
    files.index.add(
      compiler.exportNamedDeclaration({
        exports: 'ApiError',
        module: `./core/ApiError${ext}`,
      }),
    );
    if (config.services.response === 'response') {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: { asType: true, name: 'ApiResult' },
          module: `./core/ApiResult${ext}`,
        }),
      );
    }
    if (config.name) {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: 'BaseHttpRequest',
          module: `./core/BaseHttpRequest${ext}`,
        }),
      );
    }
    if (config.client.name !== 'angular') {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: ['CancelablePromise', 'CancelError'],
          module: `./core/CancelablePromise${ext}`,
        }),
      );
    }
    files.index.add(
      compiler.exportNamedDeclaration({
        exports: ['OpenAPI', { asType: true, name: 'OpenAPIConfig' }],
        module: `./core/OpenAPI${ext}`,
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
          module: `./${file.getName(false)}${ext}`,
        }),
      );
    });
};
