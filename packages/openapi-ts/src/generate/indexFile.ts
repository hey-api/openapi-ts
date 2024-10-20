import { compiler } from '../compiler';
import type { Files } from '../types/utils';
import { getConfig } from '../utils/config';
import { TypeScriptFile } from './files';

export const generateIndexFile = ({ files }: { files: Files }): void => {
  const config = getConfig();

  files.index = new TypeScriptFile({
    dir: config.output.path,
    name: 'index.ts',
  });

  if (config.name) {
    files.index.add(
      compiler.exportNamedDeclaration({
        exports: config.name,
        module: `./${config.name}`,
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
    if (config.services.response === 'response') {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: { asType: true, name: 'ApiResult' },
          module: './core/ApiResult',
        }),
      );
    }
    if (config.name) {
      files.index.add(
        compiler.exportNamedDeclaration({
          exports: 'BaseHttpRequest',
          module: './core/BaseHttpRequest',
        }),
      );
    }
    if (config.client.name !== 'legacy/angular') {
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
      const file = files[name];

      if (name === 'index' || file.isEmpty()) {
        return;
      }

      files.index.add(
        compiler.exportAllDeclaration({
          module: `./${file.getName(false)}`,
        }),
      );
    });
};
