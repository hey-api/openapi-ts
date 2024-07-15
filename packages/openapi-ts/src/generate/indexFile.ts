import { compiler, TypeScriptFile } from '../compiler';
import { getConfig } from '../utils/config';

export const generateIndexFile = async ({
  files,
}: {
  files: Record<string, TypeScriptFile>;
}): Promise<void> => {
  const config = getConfig();

  if (config.name) {
    files.index.add(compiler.export.named([config.name], `./${config.name}`));
  }

  if (config.exportCore) {
    files.index.add(compiler.export.named('ApiError', './core/ApiError'));
    if (config.services.response === 'response') {
      files.index.add(
        compiler.export.named(
          { asType: true, name: 'ApiResult' },
          './core/ApiResult',
        ),
      );
    }
    if (config.name) {
      files.index.add(
        compiler.export.named('BaseHttpRequest', './core/BaseHttpRequest'),
      );
    }
    if (config.client !== 'angular') {
      files.index.add(
        compiler.export.named(
          ['CancelablePromise', 'CancelError'],
          './core/CancelablePromise',
        ),
      );
    }
    files.index.add(
      compiler.export.named(
        ['OpenAPI', { asType: true, name: 'OpenAPIConfig' }],
        './core/OpenAPI',
      ),
    );
  }

  Object.entries(files).forEach(([name, file]) => {
    if (name === 'index' || file.isEmpty()) {
      return;
    }

    files.index.add(compiler.export.all(`./${file.getName(false)}`));
  });
};
