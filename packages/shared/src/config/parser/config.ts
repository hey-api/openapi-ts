import { coerce, valueToObject } from '../utils/config';
import type { Parser, UserParser } from './types';

export const defaultPaginationKeywords = [
  'after',
  'before',
  'cursor',
  'offset',
  'page',
  'start',
] as const;

export function getParser(userConfig: { parser?: UserParser }): Parser {
  const parser = valueToObject({
    defaultValue: {
      hooks: {},
      pagination: coerce((value) =>
        valueToObject({
          defaultValue: {
            keywords: defaultPaginationKeywords,
          },
          value: value as UserParser['pagination'],
        }),
      ),
      transforms: coerce((value) =>
        valueToObject({
          defaultValue: {
            enums: coerce((value) =>
              valueToObject({
                defaultValue: {
                  case: 'PascalCase',
                  enabled: value !== undefined ? Boolean(value) : false,
                  mode: 'root',
                  name: '{{name}}Enum',
                },
                mappers: {
                  boolean: (enabled) => ({ enabled }),
                  string: (mode) => ({ mode }),
                },
                value: value as NonNullable<UserParser['transforms']>['enums'],
              }),
            ),
            propertiesRequiredByDefault: false,
            readWrite: coerce((value) =>
              valueToObject({
                defaultValue: {
                  enabled: value !== undefined ? Boolean(value) : true,
                  requests: coerce((value) =>
                    valueToObject({
                      defaultValue: {
                        case: 'preserve',
                        name: '{{name}}Writable',
                      },
                      mappers: {
                        function: (name) => ({ name }),
                        string: (name) => ({ name }),
                      },
                      value: value as Extract<
                        NonNullable<NonNullable<UserParser['transforms']>['readWrite']>,
                        object
                      >['requests'],
                    }),
                  ),
                  responses: coerce((value) =>
                    valueToObject({
                      defaultValue: {
                        case: 'preserve',
                        name: '{{name}}',
                      },
                      mappers: {
                        function: (name) => ({ name }),
                        string: (name) => ({ name }),
                      },
                      value: value as Extract<
                        NonNullable<NonNullable<UserParser['transforms']>['readWrite']>,
                        object
                      >['responses'],
                    }),
                  ),
                },
                mappers: {
                  boolean: (enabled) => ({ enabled }),
                },
                value: value as NonNullable<UserParser['transforms']>['readWrite'],
              }),
            ),
            schemaName: undefined,
          },
          value: value as UserParser['transforms'],
        }),
      ),
      validate_EXPERIMENTAL: coerce(
        (value) => (value === true ? 'warn' : value) as 'strict' | 'warn' | boolean | undefined,
      ),
    },
    value: userConfig.parser,
  });
  return parser as Parser;
}
