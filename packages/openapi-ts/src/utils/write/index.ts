import { compiler, TypeScriptFile } from '../../compiler';
import { getConfig } from '../config';

export const processIndex = async ({
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

  if (files.schemas && !files.schemas.isEmpty()) {
    files.index.add(compiler.export.all(`./${files.schemas.getName(false)}`));
  }
  if (files.services && !files.services.isEmpty()) {
    files.index.add(compiler.export.all(`./${files.services.getName(false)}`));
  }
  if (files.types && !files.types.isEmpty()) {
    files.index.add(compiler.export.all(`./${files.types.getName(false)}`));
  }
};
