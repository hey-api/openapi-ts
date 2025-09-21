import type { Config, UserConfig } from '../types/config';
import { valueToObject } from './utils/config';

export const getOutput = (userConfig: UserConfig): Config['output'] => {
  const output = valueToObject({
    defaultValue: {
      clean: true,
      fileName: {
        case: 'preserve',
        name: '{{name}}',
        suffix: '.gen',
      },
      format: false,
      indexFile: true,
      lint: false,
      path: '',
      tsConfigPath: '',
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
  });
  return output as Config['output'];
};
