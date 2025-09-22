import type { Config, UserConfig } from '../types/config';
import { valueToObject } from './utils/config';

export const defaultPaginationKeywords = [
  'after',
  'before',
  'cursor',
  'offset',
  'page',
  'start',
] as const;

// TODO: use valueToObject for the whole parser config
export const getParser = (userConfig: UserConfig): Config['parser'] => {
  const parser: Config['parser'] = {
    ...userConfig.parser,
    hooks: {},
    pagination: {
      keywords: defaultPaginationKeywords,
    },
    transforms: {
      enums: {
        case: 'PascalCase',
        enabled: false,
        mode: 'root',
        name: '{{name}}Enum',
      },
      propertiesRequiredByDefault: false,
      readWrite: {
        enabled: true,
        requests: {
          case: 'preserve',
          name: '{{name}}Writable',
        },
        responses: {
          case: 'preserve',
          name: '{{name}}',
        },
      },
    },
    validate_EXPERIMENTAL: false,
  };

  if (userConfig.parser) {
    if (userConfig.parser.hooks) {
      parser.hooks = userConfig.parser.hooks;
    }

    if (userConfig.parser.pagination?.keywords) {
      parser.pagination.keywords = userConfig.parser.pagination.keywords;
    }

    if (userConfig.parser.transforms) {
      if (userConfig.parser.transforms.enums !== undefined) {
        parser.transforms.enums = valueToObject({
          defaultValue: {
            ...parser.transforms.enums,
            enabled: Boolean(userConfig.parser.transforms.enums),
          },
          mappers: {
            boolean: (enabled) => ({ enabled }),
            string: (mode) => ({ mode }),
          },
          value: userConfig.parser.transforms.enums,
        }) as typeof parser.transforms.enums;
      }

      if (
        userConfig.parser.transforms.propertiesRequiredByDefault !== undefined
      ) {
        parser.transforms.propertiesRequiredByDefault =
          userConfig.parser.transforms.propertiesRequiredByDefault;
      }

      if (userConfig.parser.transforms.readWrite !== undefined) {
        parser.transforms.readWrite = valueToObject({
          defaultValue: {
            ...parser.transforms.readWrite,
            enabled: Boolean(userConfig.parser.transforms.readWrite),
          },
          mappers: {
            boolean: (enabled) => ({ enabled }),
            object: (fields) => ({
              ...fields,
              requests: valueToObject({
                defaultValue: parser.transforms.readWrite.requests,
                mappers: {
                  function: (name) => ({ name }),
                  string: (name) => ({ name }),
                },
                value: fields.requests,
              }),
              responses: valueToObject({
                defaultValue: parser.transforms.readWrite.responses,
                mappers: {
                  function: (name) => ({ name }),
                  string: (name) => ({ name }),
                },
                value: fields.responses,
              }),
            }),
          },
          value: userConfig.parser.transforms.readWrite,
        }) as typeof parser.transforms.readWrite;
      }
    }

    if (userConfig.parser.validate_EXPERIMENTAL) {
      parser.validate_EXPERIMENTAL =
        userConfig.parser.validate_EXPERIMENTAL === true
          ? 'warn'
          : userConfig.parser.validate_EXPERIMENTAL;
    }
  }

  return parser;
};
