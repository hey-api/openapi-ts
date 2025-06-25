import type { Config, UserConfig } from '../types/config';

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
      enums: 'off',
    },
    validate_EXPERIMENTAL: false,
  };

  if (userConfig.parser) {
    if (userConfig.parser.pagination?.keywords) {
      parser.pagination.keywords = userConfig.parser.pagination.keywords;
    }

    if (userConfig.parser.transforms) {
      parser.transforms = {
        ...parser.transforms,
        ...userConfig.parser.transforms,
      };
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
