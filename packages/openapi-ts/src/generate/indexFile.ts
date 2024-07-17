import { compiler, TypeScriptFile } from '../compiler';
import { getConfig } from '../utils/config';

export const generateIndexFile = async ({
  files,
}: {
  files: Record<string, TypeScriptFile>;
}): Promise<void> => {
  const config = getConfig();

  if (config.name) {
    files.index.add(
      compiler.export.named({
        exports: config.name,
        module: `./${config.name}`,
      }),
    );
  }

  if (config.exportCore) {
    files.index.add(
      compiler.export.named({
        exports: 'ApiError',
        module: './core/ApiError',
      }),
    );
    if (config.services.response === 'response') {
      files.index.add(
        compiler.export.named({
          exports: { asType: true, name: 'ApiResult' },
          module: './core/ApiResult',
        }),
      );
    }
    if (config.name) {
      files.index.add(
        compiler.export.named({
          exports: 'BaseHttpRequest',
          module: './core/BaseHttpRequest',
        }),
      );
    }
    if (config.client.name !== 'angular') {
      files.index.add(
        compiler.export.named({
          exports: ['CancelablePromise', 'CancelError'],
          module: './core/CancelablePromise',
        }),
      );
    }
    files.index.add(
      compiler.export.named({
        exports: ['OpenAPI', { asType: true, name: 'OpenAPIConfig' }],
        module: './core/OpenAPI',
      }),
    );
  }

  Object.entries(files).forEach(([name, file]) => {
    if (name === 'index' || file.isEmpty()) {
      return;
    }

    files.index.add(
      compiler.export.all({
        module: `./${file.getName(false)}`,
      }),
    );
  });
};
