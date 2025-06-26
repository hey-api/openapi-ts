import type { Config, UserConfig } from '../types/config';
import { valueToObject } from './utils';

export const defaultPaginationKeywords = [
  'after',
  'before',
  'cursor',
  'offset',
  'page',
  'start',
] as const;

export const getParser = (userConfig: UserConfig): Config['parser'] => {
  const parser: Config['parser'] = {
    ...userConfig.parser,
    pagination: {
      keywords: defaultPaginationKeywords,
    },
    transforms: {
      enums: false,
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
    if (userConfig.parser.pagination?.keywords) {
      parser.pagination.keywords = userConfig.parser.pagination.keywords;
    }

    if (userConfig.parser.transforms?.enums) {
      parser.transforms.enums = userConfig.parser.transforms.enums;
    }

    parser.transforms.readWrite = valueToObject({
      defaultValue: parser.transforms.readWrite,
      mappers: {
        boolean: (enabled) => ({ enabled }),
        object: (fields) => ({
          ...fields,
          requests: valueToObject({
            defaultValue: parser.transforms.readWrite.requests,
            mappers: {
              string: (name) => ({ name }),
            },
            value: fields.requests,
          }),
          responses: valueToObject({
            defaultValue: parser.transforms.readWrite.responses,
            mappers: {
              string: (name) => ({ name }),
            },
            value: fields.responses,
          }),
        }),
      },
      value: userConfig.parser.transforms?.readWrite,
    }) as typeof parser.transforms.readWrite;

    if (userConfig.parser.validate_EXPERIMENTAL) {
      parser.validate_EXPERIMENTAL =
        userConfig.parser.validate_EXPERIMENTAL === true
          ? 'warn'
          : userConfig.parser.validate_EXPERIMENTAL;
    }
  }

  return parser;
};
