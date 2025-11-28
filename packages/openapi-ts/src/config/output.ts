import ts from 'typescript';

import { findTsConfigPath, loadTsConfig } from '~/generate/tsConfig';
import type { Config, UserConfig } from '~/types/config';

import { valueToObject } from './utils/config';

export const getOutput = (userConfig: UserConfig): Config['output'] => {
  if (userConfig.output instanceof Array) {
    throw new Error(
      'Unexpected array of outputs in user configuration. This should have been expanded already.',
    );
  }

  const output = valueToObject({
    defaultValue: {
      clean: true,
      fileName: {
        case: 'preserve',
        name: '{{name}}',
        suffix: '.gen',
      },
      format: null,
      indexFile: true,
      lint: null,
      path: '',
      preferExportAll: false,
    },
    mappers: {
      object: (fields, defaultValue) => ({
        ...fields,
        fileName: valueToObject({
          defaultValue: {
            ...(defaultValue.fileName as Extract<
              typeof defaultValue.fileName,
              Record<string, unknown>
            >),
          },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: fields.fileName,
        }),
      }),
      string: (path) => ({ path }),
    },
    value: userConfig.output,
  }) as Config['output'];
  output.tsConfig = loadTsConfig(findTsConfigPath(output.tsConfigPath));
  if (
    output.importFileExtension === undefined &&
    output.tsConfig?.options.moduleResolution ===
      ts.ModuleResolutionKind.NodeNext
  ) {
    output.importFileExtension = '.js';
  }
  if (
    output.importFileExtension &&
    !output.importFileExtension.startsWith('.')
  ) {
    output.importFileExtension = `.${output.importFileExtension}`;
  }
  return output;
};
